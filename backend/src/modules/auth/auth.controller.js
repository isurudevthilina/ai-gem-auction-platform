const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const authService = require('./auth.service');

const register = catchAsync(async (req, res) => {
    const result = await authService.registerUser(req.body);
    apiResponse(res, 201, result, result.message);
});

const login = catchAsync(async (req, res) => {
    const result = await authService.loginUser(req.body);
    apiResponse(res, 200, result, 'Login successful.');
});

const logout = catchAsync(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.logoutUser(token);
    apiResponse(res, 200, null, result.message);
});

const me = catchAsync(async (req, res) => {
    const profile = await authService.getMe(req.user.id);
    apiResponse(res, 200, profile, 'Profile fetched.');
});

const refresh = catchAsync(async (req, res) => {
    const result = await authService.refreshSession(req.body.refresh_token);
    apiResponse(res, 200, result, 'Token refreshed.');
});

const resendVerification = catchAsync(async (req, res) => {
    const result = await authService.resendVerification(req.body.email);
    apiResponse(res, 200, null, result.message);
});

module.exports = { register, login, logout, me, refresh, resendVerification };
