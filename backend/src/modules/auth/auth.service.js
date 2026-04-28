const { supabase, supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');
const { sendPasswordResetOTP: sendOTPEmail, sendVerificationOTP } = require('../../utils/email');
const crypto = require('crypto');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendPasswordResetOTP = async (email) => {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (profileError) {
        console.error('Profile lookup error:', profileError.message);
        throw new ApiError(500, 'Unable to process request.');
    }

    if (!profile) {
        // Return generic success to prevent email enumeration
        return { message: 'If an account exists, a password reset OTP has been sent.' };
    }

    // Delete any existing OTPs for this email
    await supabaseAdmin
        .from('password_reset_otps')
        .delete()
        .eq('email', normalizedEmail);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const { error: insertError } = await supabaseAdmin
        .from('password_reset_otps')
        .insert({ email: normalizedEmail, otp, expires_at: expiresAt });

    if (insertError) {
        console.error('OTP insert error:', insertError.message);
        if (insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
            throw new ApiError(500, 'Database table "password_reset_otps" is missing. Please run the setup SQL in Supabase.');
        }
        throw new ApiError(500, 'Failed to generate OTP: ' + insertError.message);
    }

    try {
        await sendOTPEmail(normalizedEmail, otp);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message);
        // Clean up the OTP since email failed
        await supabaseAdmin
            .from('password_reset_otps')
            .delete()
            .eq('email', normalizedEmail);

        let userMessage = 'Failed to send email. Please try again later.';
        if (err.message?.includes('535') || err.message?.includes('Username and Password not accepted')) {
            userMessage = 'Email server rejected the login. If using Gmail, create an App Password at myaccount.google.com/apppasswords and use it instead of your normal password.';
        } else if (err.message?.includes('ENOTFOUND') || err.message?.includes('getaddrinfo')) {
            userMessage = 'Cannot connect to email server. Please check your SMTP_HOST in .env.';
        } else if (err.message?.includes('ETIMEDOUT')) {
            userMessage = 'Email server connection timed out. Check your SMTP_PORT and firewall settings.';
        }

        throw new ApiError(500, userMessage);
    }

    return { message: 'If an account exists, a password reset OTP has been sent.' };
};

const verifyPasswordResetOTP = async ({ email, otp }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabaseAdmin
        .from('password_reset_otps')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (error || !data) {
        throw new ApiError(400, 'Invalid or expired OTP.');
    }

    return { valid: true, message: 'OTP verified successfully.' };
};

const resetPasswordWithOTP = async ({ email, otp, new_password }) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP again
    const { data: otpRecord, error: otpError } = await supabaseAdmin
        .from('password_reset_otps')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (otpError || !otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP.');
    }

    // Find the user profile to get auth user id
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (profileError || !profile) {
        throw new ApiError(404, 'User not found.');
    }

    // Update password via admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        { password: new_password }
    );

    if (updateError) {
        throw new ApiError(400, updateError.message || 'Failed to reset password.');
    }

    // Delete used OTP
    await supabaseAdmin
        .from('password_reset_otps')
        .delete()
        .eq('email', normalizedEmail);

    return { message: 'Password reset successfully. You can now log in with your new password.' };
};


const createAndSendVerification = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Find the user
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (profileError || !profile) {
        console.error('Profile not found for verification:', profileError?.message);
        throw new ApiError(500, 'Unable to process request.');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store OTP in user_metadata (secure — only accessible via admin API or authenticated session)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        {
            user_metadata: {
                verification_otp: otp,
                verification_otp_expires_at: expiresAt,
            },
        }
    );

    if (updateError) {
        console.error('Failed to store verification OTP:', updateError.message);
        throw new ApiError(500, 'Failed to generate verification code.');
    }

    try {
        await sendVerificationOTP(normalizedEmail, otp);
    } catch (err) {
        console.error('Failed to send verification email:', err.message);
        let userMessage = 'Failed to send verification email. Please try again later.';
        if (err.message?.includes('535') || err.message?.includes('Username and Password not accepted')) {
            userMessage = 'Email server rejected the login. If using Gmail, create an App Password at myaccount.google.com/apppasswords.';
        }
        throw new ApiError(500, userMessage);
    }
};

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
    // email_confirm: false — we handle verification ourselves via SMTP
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
        email_verified: false,
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

    // Send verification email via our SMTP
    try {
        await createAndSendVerification(email);
    } catch (err) {
        // If email fails, we still created the user. They can resend verification.
        console.error('Verification email failed during registration:', err.message);
        return {
            user: authData.user,
            message: 'Account created, but we could not send the verification email. Please use "Resend verification" on the login page.',
            email_sent: false,
        };
    }

    return {
        user: authData.user,
        message: 'Registration successful. Please check your email to verify your account.',
        email_sent: true,
    };
};

const loginUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message && error.message.includes('Email not confirmed')) {
            throw new ApiError(403, 'Please verify your email before logging in. Check your inbox or click Resend verification below.');
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

const verifyEmailOTP = async ({ email, otp }) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Find the auth user
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email_verified')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (profileError || !profile) {
        throw new ApiError(404, 'User not found.');
    }

    // Already verified?
    if (profile.email_verified) {
        return { message: 'Your email is already verified. You can now log in.' };
    }

    // Get user's auth data to check OTP
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (userError || !userData?.user) {
        throw new ApiError(404, 'User not found.');
    }

    const meta = userData.user.user_metadata || {};
    const storedOtp = meta.verification_otp;
    const expiresAt = meta.verification_otp_expires_at;

    if (!storedOtp || !expiresAt) {
        throw new ApiError(400, 'No verification code found. Please request a new one.');
    }

    if (new Date() > new Date(expiresAt)) {
        throw new ApiError(400, 'Verification code has expired. Please request a new one.');
    }

    if (storedOtp !== otp) {
        throw new ApiError(400, 'Invalid verification code.');
    }

    // Confirm email in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        {
            email_confirm: true,
            user_metadata: {
                ...meta,
                verification_otp: null,
                verification_otp_expires_at: null,
            },
        }
    );

    if (updateError) {
        throw new ApiError(500, updateError.message || 'Failed to verify email.');
    }

    // Update profile
    await supabaseAdmin
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', profile.id);

    return { message: 'Email verified successfully. You can now log in.' };
};

const resendVerification = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists and is already verified
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email_verified')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (!profile) {
        // Return generic success to prevent email enumeration
        return { message: 'If an account exists, a verification email has been sent.' };
    }

    if (profile.email_verified) {
        return { message: 'Your email is already verified. You can log in.' };
    }

    await createAndSendVerification(normalizedEmail);

    return { message: 'If an account exists, a verification email has been sent.' };
};

module.exports = { registerUser, loginUser, logoutUser, getMe, refreshSession, resendVerification, sendPasswordResetOTP, verifyPasswordResetOTP, resetPasswordWithOTP, verifyEmailOTP };
