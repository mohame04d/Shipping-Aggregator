
import catchAsync from '../../utils/catchAsync.js';
import AuthService from './auth.service.js';

const signUp = catchAsync((req, res, next) => {
    return AuthService.signUp(req, res, next);
});

const login = catchAsync((req, res, next) => {
    return AuthService.login(req, res, next);
});

const logOut = catchAsync((req, res, next) => {
    return AuthService.logOut(req, res, next);
});

const refreshToken = catchAsync((req, res, next) => {
    return AuthService.refreshToken(req, res, next);
});

const getMe = catchAsync((req,res,next)=>{
    return AuthService.getMe(req,res,next)
})

const protect= catchAsync((req,res,next)=>{
    return AuthService.protected(req,res,next)
})

export { signUp, login, logOut, refreshToken, protect, getMe};
