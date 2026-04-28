const ApiError = require('../../utils/apiError');
const { supabaseAdmin } = require('../../config/supabase');
const repository = require('./users.repository');
const crypto = require('crypto');
const {
    sendProfileEmailChangeOTP,
    sendProfilePasswordChangeOTP,
} = require('../../utils/email');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const OTP_TTL_MS = 15 * 60 * 1000;
const PROFILE_CHANGE_KEYS = [
    'profile_change_otp_hash',
    'profile_change_otp_expires_at',
    'profile_change_type',
    'pending_new_email',
];

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const getAuthUserMetadata = async (userId) => {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data?.user) throw new ApiError(404, 'User not found');
    return data.user.user_metadata || {};
};

const setProfileChangeOTP = async (userId, metadata) => {
    const currentMetadata = await getAuthUserMetadata(userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...currentMetadata, ...metadata },
    });
    if (error) throw new ApiError(500, 'Failed to generate verification code.');
};

const clearProfileChangeOTP = async (userId) => {
    const currentMetadata = await getAuthUserMetadata(userId);
    PROFILE_CHANGE_KEYS.forEach((key) => delete currentMetadata[key]);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: currentMetadata,
    });
    if (error) console.error('Failed to clear profile change OTP:', error.message);
};

const verifyCurrentPassword = async (profile, currentPassword) => {
    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
    });
    if (authError) throw new ApiError(401, 'Current password is incorrect');
};

const verifyProfileChangeOTP = async (userId, type, otp) => {
    const metadata = await getAuthUserMetadata(userId);
    if (metadata.profile_change_type !== type) {
        throw new ApiError(400, 'Please request a new verification code.');
    }

    if (!metadata.profile_change_otp_hash || !metadata.profile_change_otp_expires_at) {
        throw new ApiError(400, 'Please request a new verification code.');
    }

    if (new Date(metadata.profile_change_otp_expires_at).getTime() <= Date.now()) {
        await clearProfileChangeOTP(userId);
        throw new ApiError(400, 'Invalid or expired OTP.');
    }

    if (metadata.profile_change_otp_hash !== hashOTP(otp)) {
        throw new ApiError(400, 'Invalid or expired OTP.');
    }

    return metadata;
};

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

const requestEmailChangeOTP = async (userId, newEmail, currentPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const normalizedEmail = newEmail.toLowerCase().trim();
    await verifyCurrentPassword(profile, currentPassword);

    const existing = await repository.findByEmail(normalizedEmail, userId);
    if (existing) throw new ApiError(409, 'Email already in use');

    const otp = generateOTP();
    await setProfileChangeOTP(userId, {
        profile_change_otp_hash: hashOTP(otp),
        profile_change_otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
        profile_change_type: 'email',
        pending_new_email: normalizedEmail,
    });

    try {
        await sendProfileEmailChangeOTP(normalizedEmail, otp);
    } catch (err) {
        console.error('Failed to send email change OTP:', err.message);
        await clearProfileChangeOTP(userId);
        throw new ApiError(500, 'Failed to send verification email. Please try again later.');
    }

    return { message: 'Verification code sent to your new email address.' };
};

const changeEmail = async (userId, newEmail, otp) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    const normalizedEmail = newEmail.toLowerCase().trim();
    const metadata = await verifyProfileChangeOTP(userId, 'email', otp);

    if (metadata.pending_new_email !== normalizedEmail) {
        throw new ApiError(400, 'This code was requested for a different email address.');
    }

    const existing = await repository.findByEmail(normalizedEmail, userId);
    if (existing) throw new ApiError(409, 'Email already in use');

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: normalizedEmail,
        email_confirm: true,
    });
    if (updateError) throw new ApiError(400, updateError.message || 'Failed to update email.');

    await repository.update(userId, { email: normalizedEmail, email_verified: true });
    await clearProfileChangeOTP(userId);

    return { message: 'Email updated successfully.' };
};

const requestPasswordChangeOTP = async (userId, currentPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    await verifyCurrentPassword(profile, currentPassword);

    const otp = generateOTP();
    await setProfileChangeOTP(userId, {
        profile_change_otp_hash: hashOTP(otp),
        profile_change_otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
        profile_change_type: 'password',
        pending_new_email: null,
    });

    try {
        await sendProfilePasswordChangeOTP(profile.email, otp);
    } catch (err) {
        console.error('Failed to send password change OTP:', err.message);
        await clearProfileChangeOTP(userId);
        throw new ApiError(500, 'Failed to send verification email. Please try again later.');
    }

    return { message: 'Verification code sent to your current email address.' };
};

const changePassword = async (userId, otp, newPassword) => {
    const profile = await repository.findById(userId);
    if (!profile) throw new ApiError(404, 'Profile not found');

    await verifyProfileChangeOTP(userId, 'password', otp);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
    if (updateError) throw new ApiError(400, updateError.message || 'Failed to update password.');

    await clearProfileChangeOTP(userId);

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
