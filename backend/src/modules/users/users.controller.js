const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const service = require('./users.service');

const getProfile = catchAsync(async (req, res) => {
    const profile = await service.getProfile(req.user.id);
    apiResponse(res, 200, profile, 'Profile retrieved.');
});

const updateProfile = catchAsync(async (req, res) => {
    const profile = await service.updateProfile(req.user.id, req.body);
    apiResponse(res, 200, profile, 'Profile updated.');
});

const uploadAvatar = catchAsync(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file provided');
    const profile = await service.uploadAvatar(req.user.id, req.file);
    apiResponse(res, 200, profile, 'Avatar updated.');
});

const requestEmailChangeOTP = catchAsync(async (req, res) => {
    const result = await service.requestEmailChangeOTP(
        req.user.id, req.body.new_email, req.body.current_password,
    );
    apiResponse(res, 200, result, result.message);
});

const changeEmail = catchAsync(async (req, res) => {
    const result = await service.changeEmail(
        req.user.id, req.body.new_email, req.body.otp,
    );
    apiResponse(res, 200, result, result.message);
});

const requestPasswordChangeOTP = catchAsync(async (req, res) => {
    const result = await service.requestPasswordChangeOTP(
        req.user.id, req.body.current_password,
    );
    apiResponse(res, 200, result, result.message);
});

const changePassword = catchAsync(async (req, res) => {
    const result = await service.changePassword(
        req.user.id, req.body.otp, req.body.new_password,
    );
    apiResponse(res, 200, result, result.message);
});

const deleteAccount = catchAsync(async (req, res) => {
    const result = await service.deleteAccount(
        req.user.id, req.body.current_password,
    );
    apiResponse(res, 200, result, result.message);
});

const getPublicProfile = catchAsync(async (req, res) => {
    const profile = await service.getPublicProfile(req.params.id);
    apiResponse(res, 200, profile, 'Seller profile retrieved.');
});

const searchSellers = catchAsync(async (req, res) => {
    const { q, limit } = req.query;
    const data = await service.searchSellers(q, limit);
    apiResponse(res, 200, data, 'Sellers found.');
});

/* ── Admin handlers ── */

const adminGetAllUsers = catchAsync(async (req, res) => {
    const filters = {
        query: req.query.query,
        role: req.query.role,
        is_verified: req.query.is_verified === 'true' ? true
            : req.query.is_verified === 'false' ? false : undefined,
        sort: req.query.sort,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await service.adminGetAllUsers(filters);
    apiResponse(res, 200, result, 'Users fetched');
});

const adminGetUserById = catchAsync(async (req, res) => {
    const user = await service.adminGetUserById(req.params.id);
    apiResponse(res, 200, user, 'User fetched');
});

const adminUpdateUser = catchAsync(async (req, res) => {
    const updated = await service.adminUpdateUser(req.user.id, req.params.id, req.body);
    apiResponse(res, 200, updated, 'User updated');
});

const adminDeactivateUser = catchAsync(async (req, res) => {
    const result = await service.adminDeactivateUser(req.user.id, req.params.id);
    apiResponse(res, 200, result, 'User deactivated');
});

const getUserStats = catchAsync(async (req, res) => {
    const stats = await service.getUserStats();
    apiResponse(res, 200, stats, 'User stats fetched');
});

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    requestEmailChangeOTP,
    changeEmail,
    requestPasswordChangeOTP,
    changePassword,
    deleteAccount,
    adminGetAllUsers,
    adminGetUserById,
    adminUpdateUser,
    adminDeactivateUser,
    getUserStats,
    getPublicProfile,
    searchSellers,
};
