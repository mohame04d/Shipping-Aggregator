import catchAsync from '../../utils/catchAsync.js';
import AuthService from './auth.service.js';

const authService= new AuthService();

const signUp = catchAsync((req, res, next) => {
    return authService.signUp(req, res, next);
});

const login = catchAsync((req, res, next) => {
    return authService.login(req, res, next);
});

const logOut = catchAsync((req, res, next) => {
    return authService.logOut(req, res, next);
});

const refreshToken = catchAsync((req, res, next) => {
    return authService.refreshToken(req, res, next);
});

const getMe = catchAsync((req,res,next)=>{
    return authService.getMe(req,res,next)
})

const protect= catchAsync((req,res,next)=>{
    return authService.protected(req,res,next)
})

const restrictedTo = (...roles) => {
    return authService.restrictedTo(...roles);
};

export { signUp, login, logOut, refreshToken, protect, restrictedTo, getMe};
