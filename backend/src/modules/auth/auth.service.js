const { supabase, supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const registerUser = async (data) => {
    const { full_name, email, password, role, phone_number, district, province, nic_number, business_name, business_registration_number, business_address } = data;

    // Check if email already exists in profiles
    const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (existing) {
        throw new ApiError(409, 'Email already registered.');
    }

    // Create user via admin API (bypasses RLS, trigger creates profile)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name, role, phone_number: phone_number || undefined },
    });

    if (authError) {
        if (authError.message && authError.message.includes('already been registered')) {
            throw new ApiError(409, 'Email already registered.');
        }
        throw new ApiError(400, authError.message);
    }

    // Upsert profile with all fields (trigger only inserts basic fields)
    const profilePayload = {
        id: authData.user.id,
        email,
        full_name,
        role,
        phone_number: phone_number || null,
        district: district || null,
        province: province || null,
    };

    if (role === 'seller') {
        profilePayload.nic_number = nic_number || null;
        profilePayload.business_name = business_name || null;
        profilePayload.business_registration_number = business_registration_number || null;
        profilePayload.business_address = business_address || null;
    }

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
        console.error('Profile upsert error:', profileError.message);
    }

    // Send verification email via SMTP
    const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
    });

    if (resendError) {
        console.error('Verification email error:', resendError.message);
    }

    return { user: authData.user, message: 'Registration successful. Please verify your email.' };
};

const loginUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message && error.message.includes('Email not confirmed')) {
            throw new ApiError(403, 'Please verify your email before logging in.');
        }
        if (error.message && error.message.includes('Invalid login credentials')) {
            throw new ApiError(401, 'Invalid email or password.');
        }
        throw new ApiError(401, error.message);
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    // Update last_login_at
    await supabaseAdmin
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

    return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
        profile,
    };
};

const logoutUser = async (token) => {
    // Revoke session server-side
    await supabaseAdmin.auth.admin.signOut(token);
    return { message: 'Logged out successfully.' };
};

const getMe = async (userId) => {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new ApiError(404, 'Profile not found.');
    }

    return profile;
};

const refreshSession = async (refreshToken) => {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
        throw new ApiError(401, 'Invalid or expired refresh token.');
    }

    return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    };
};

const resendVerification = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });

    if (error) {
        throw new ApiError(400, error.message);
    }

    return { message: 'Verification email sent.' };
};

module.exports = { registerUser, loginUser, logoutUser, getMe, refreshSession, resendVerification };
