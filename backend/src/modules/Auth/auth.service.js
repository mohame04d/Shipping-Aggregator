import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';
import AppError from '../../utils/appError.js';

const cookieOptions = {
    httpOnly: true,
};

// 1. Create Access Token
const signToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// 2. Create Refresh Token
const signRefreshToken = (id, countEX = 7) => {
    return jwt.sign(
        { id, countEX },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
};

// 3. Prepare Refresh Token
const prepareRefreshToken = async (id, countEX = 7) => {
    const refreshToken = signRefreshToken(id, countEX);

    const tokenHash = await bcrypt.hash(refreshToken, 12);

    const decoded = jwt.decode(refreshToken);

    return {
        refreshToken,
        tokenHash,
        expiresAt: new Date(decoded.exp * 1000)
    };
};

// 4. Clear Cookies
const clearCookie = (res) => {
    res.clearCookie('jwt', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
};

// 5. Set Cookies
const setCookies = (res, token, refreshToken) => {
    res.cookie('jwt', token, {
        ...cookieOptions,
        expires: new Date(
            Date.now() +
            Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000
        )
    });

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(
            Date.now() +
            Number(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN) *
            24 * 60 * 60 * 1000
        )
    });
};

// 6. Create Tokens and Send Response
const createSendTokenAndRes = async (
    user,
    statusCode,
    res,
    countEX = 7
) => {
    const token = signToken(user.id);

    const {
        refreshToken,
        tokenHash,
        expiresAt
    } = await prepareRefreshToken(user.id, countEX);

    // Revoke old active tokens and create the new one atomically.
    await prisma.$transaction(async (tx) => {
        await tx.refreshToken.updateMany({
            where: {
                userId: user.id,
                revokedAt: null
            },
            data: {
                revokedAt: new Date()
            }
        });

        await tx.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });
    });

    setCookies(res, token, refreshToken);

    const { passwordHash, ...safeUser } = user;

    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: safeUser
        }
    });
};

class AuthService {
    // 7. Sign Up
    async signUp(req, res, next) {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return next(
                new AppError(
                    'Please provide name, email and password',
                    400
                )
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (existingUser) {
            return next(
                new AppError('User already exists', 400)
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone,
                role: 'USER'
            }
        });

        return await createSendTokenAndRes(
            createdUser,
            201,
            res,
            7
        );
    }

    // 8. Login
    async login(req, res, next) {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(
                new AppError('Please provide email and password', 400)
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return next(
                new AppError('Invalid email or password', 401)
            );
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return next(
                new AppError('Invalid email or password', 401)
            );
        }

        return await createSendTokenAndRes(
            user,
            200,
            res,
            7
        );
    }

    // 9. Protect Routes
    async protected(req, res, next) {
        const token = req.cookies?.jwt;

        if (!token) {
            return next(
                new AppError('Please log in', 401)
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch {
            return next(
                new AppError('Invalid or expired access token', 401)
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return next(
                new AppError('User not found', 401)
            );
        }

        req.user = user;

        return next();
    }

    // 10. Logout
    async logOut(req, res, next) {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken && req.user?.id) {
            const record = await prisma.refreshToken.findFirst({
                where: {
                    userId: req.user.id,
                    revokedAt: null
                }
            });

            if (
                record &&
                await bcrypt.compare(refreshToken, record.tokenHash)
            ) {
                await prisma.refreshToken.updateMany({
                    where: {
                        id: record.id,
                        revokedAt: null
                    },
                    data: {
                        revokedAt: new Date()
                    }
                });
            }
        }

        clearCookie(res);

        return res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    }

    // 11. Refresh Token
    async refreshToken(req, res, next) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return next(
                new AppError('Please log in again', 401)
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
        } catch {
            clearCookie(res);

            return next(
                new AppError(
                    'Invalid or expired refresh token',
                    401
                )
            );
        }

        const record = await prisma.refreshToken.findFirst({
            where: {
                userId: decoded.id,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            }
        });

        if (
            !record ||
            !(await bcrypt.compare(refreshToken, record.tokenHash))
        ) {
            clearCookie(res);

            return next(
                new AppError(
                    'Invalid or expired refresh token',
                    401
                )
            );
        }

        if (
            decoded.countEX <= 0
        ) {
            await prisma.refreshToken.updateMany({
                where: {
                    id: record.id,
                    revokedAt: null
                },
                data: {
                    revokedAt: new Date()
                }
            });

            clearCookie(res);

            return next(
                new AppError(
                    'Refresh limit exceeded. Please log in again.',
                    401
                )
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            clearCookie(res);

            return next(
                new AppError('User not found', 401)
            );
        }

        const token = signToken(user.id);

        const {
            refreshToken: newRefreshToken,
            tokenHash,
            expiresAt
        } = await prepareRefreshToken(
            user.id,
            decoded.countEX - 1
        );

        // Revoke the old token and create its replacement.
        const rotated = await prisma.$transaction(async (tx) => {
            const result = await tx.refreshToken.updateMany({
                where: {
                    id: record.id,
                    revokedAt: null,
                    expiresAt: { gt: new Date() }
                },
                data: {
                    revokedAt: new Date()
                }
            });

            // Another request may have used this token already.
            if (result.count !== 1) {
                return false;
            }

            await tx.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt
                }
            });

            return true;
        });

        if (!rotated) {
            clearCookie(res);

            return next(
                new AppError(
                    'Refresh token has already been used. Please log in again.',
                    401
                )
            );
        }

        setCookies(res, token, newRefreshToken);

        const { passwordHash, ...safeUser } = user;

        return res.status(200).json({
            status: 'success',
            token,
            data: {
                user: safeUser
            }
        });
    }


   async getMe(req,res,next){
        const id = req.user.id

        const user = await prisma.user.findUnique({
            where:{id},
            omit:{passwordHash}
        })
        if(!user){
            return next(new AppError('user not found' , 404));
        }

        res.status(200).json({
            status:'success',
            data:{user}
        })
    }
}

export default new AuthService();
