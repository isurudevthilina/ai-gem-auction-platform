const ApiError = require('../../utils/apiError');
const { supabaseAdmin } = require('../../config/supabase');
const repository = require('./users.repository');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const getProfile = async (userId) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');
    return profile;
};

const updateProfile = async (userId, data) => {
    return repository.update(userId, data);
};

const uploadAvatar = async (userId, file) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
        throw new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed');
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new ApiError(400, 'Avatar must be under 2MB');
    }

    const ext = MIME_TO_EXT[file.mimetype];
    const path = `${userId}/avatar_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw new ApiError(500, 'Failed to upload avatar');
    }

    const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
    return repository.updateAvatar(userId, urlData.publicUrl);
};

const changeEmail = async (userId, newEmail, currentPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
    });
    if (authError) throw new ApiError(401, 'Current password is incorrect');

    const existing = await repository.findByEmail(newEmail, userId);
    if (existing) throw new ApiError(409, 'Email already in use');

    await supabaseAdmin.auth.admin.updateUserById(userId, { email: newEmail });
    await repository.update(userId, { email: newEmail });

    return { message: 'Email updated. Please verify your new email.' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
    });
    if (authError) throw new ApiError(401, 'Current password is incorrect');

    await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });

    return { message: 'Password updated successfully.' };
};

const deleteAccount = async (userId, currentPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    // Sellers cannot delete their own account
    if (profile.role === 'seller') {
        throw new ApiError(403, 'Seller accounts cannot be deleted. Please contact support.');
    }

    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
    });
    if (authError) throw new ApiError(401, 'Current password is incorrect');

    // Buyers cannot delete if they have any transactions
    const hasTx = await repository.hasAnyTransactions(userId);
    if (hasTx) {
        throw new ApiError(400, 'Cannot delete account with existing transactions.');
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
        // Fallback: manually purge data then delete
        await repository.purgeUserAndDelete(userId);
    }

    return { message: 'Account deleted successfully.' };
};

/* ── Admin service functions ── */

const adminGetAllUsers = async (filters) => {
    return repository.adminFindAll(filters);
};

const adminGetUserById = async (userId) => {
    const user = await repository.adminFindById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
};

const adminUpdateUser = async (adminId, userId, data) => {
    const { updated, oldRole } = await repository.adminUpdateUser(userId, adminId, data);

    if (data.role && data.role !== oldRole) {
        await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            type: 'auction_started',
            title: 'Account Role Updated',
            message: `Your account role has been updated to ${data.role} by an administrator.`,
            data: { old_role: oldRole, new_role: data.role },
        });
    }

    if (data.is_verified === true) {
        await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            type: 'auction_started',
            title: 'Account Verified',
            message: 'Your seller account has been verified by an administrator.',
            data: { verified: true },
        });
    }

    return updated;
};

const adminDeactivateUser = async (adminId, userId) => {
    return repository.adminDeactivateUser(userId, adminId);
};

const getUserStats = async () => {
    return repository.getUserStats();
};

const getPublicProfile = async (sellerId) => {
    const profile = await repository.getPublicProfile(sellerId);
    if (!profile) throw new ApiError(404, 'Seller not found');
    return profile;
};

const searchSellers = async (query, limit) => {
    const safeLimit = Math.min(10, Math.max(1, parseInt(limit) || 3));
    if (!query || query.length < 2) return [];
    return repository.searchSellers(query, safeLimit);
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    changeEmail,
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
