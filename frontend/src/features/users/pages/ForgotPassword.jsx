import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../../../shared/components/AuthLayout';
import authService from '../../auth/services/authService';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

const emailSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

const resetSchema = z.object({
    new_password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(passwordRegex, 'Must include uppercase, lowercase, number, and special character'),
    confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
});

const fieldStyle = (isFocused, hasError) => ({
    width: '100%', padding: '12px 14px',
    background: isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    border: `1.5px solid ${hasError ? '#dc2626' : isFocused ? '#D4AF37' : 'rgba(26,35,64,0.14)'}`,
    borderRadius: '10px', fontSize: '0.94rem', color: '#1a2340',
    outline: 'none', transition: 'all 0.22s', boxSizing: 'border-box',
    boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.10)' : isFocused ? '0 0 0 3px rgba(212,175,55,0.14)' : 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const labelStyle = {
    display: 'block', fontFamily: "'Cinzel', serif",
    fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#374151', marginBottom: '6px',
};

const btnStyle = (loading) => ({
    width: '100%', padding: '13px',
    background: loading ? 'rgba(212,175,55,0.45)' : 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
    color: '#1a2340', border: 'none', borderRadius: '10px',
    fontSize: '0.76rem', fontWeight: 700, fontFamily: "'Cinzel', serif",
    letterSpacing: '0.13em', textTransform: 'uppercase',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)',
    transition: 'all 0.22s',
});

const errorBoxStyle = {
    marginBottom: '18px', padding: '11px 14px', borderRadius: '10px',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
    color: '#dc2626', fontSize: '0.83rem', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5,
};

const successBoxStyle = {
    marginBottom: '18px', padding: '11px 14px', borderRadius: '10px',
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)',
    color: '#16a34a', fontSize: '0.83rem', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5,
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [focused, setFocused] = useState(null);

    const emailForm = useForm({ resolver: zodResolver(emailSchema) });
    const otpForm = useForm({ resolver: zodResolver(otpSchema) });
    const resetForm = useForm({ resolver: zodResolver(resetSchema) });

    const f = (key) => ({
        style: fieldStyle(focused === key, !!emailForm.formState.errors[key] || !!otpForm.formState.errors[key] || !!resetForm.formState.errors[key]),
        onFocus: () => setFocused(key),
        onBlur: () => setFocused(null),
    });

    const onSendOTP = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await authService.forgotPassword(values.email);
            setEmail(values.email);
            setSuccess('OTP sent! Please check your email inbox (and spam folder).');
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Failed to send OTP. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOTP = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await authService.verifyOTP(email, values.otp);
            setOtp(values.otp);
            setSuccess('OTP verified. Create your new password below.');
            setStep(3);
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Invalid OTP. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await authService.resetPassword(email, otp, values.new_password);
            setSuccess('Password reset successful!');
            setStep(4);
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Failed to reset password. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={emailForm.handleSubmit(onSendOTP)} noValidate>
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...emailForm.register('email')}
                    {...f('email')}
                />
                {emailForm.formState.errors.email && (
                    <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {emailForm.formState.errors.email.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                style={btnStyle(loading)}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)'; }}
            >
                {loading ? 'Sending OTP\u2026' : 'Send OTP'}
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} noValidate>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: '#4b5563', marginBottom: '16px', lineHeight: 1.5 }}>
                We&apos;ve sent a 6-digit OTP to <strong>{email}</strong>. Enter it below to continue.
            </p>
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>6-Digit OTP</label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    {...otpForm.register('otp')}
                    {...f('otp')}
                />
                {otpForm.formState.errors.otp && (
                    <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {otpForm.formState.errors.otp.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                style={btnStyle(loading)}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)'; }}
            >
                {loading ? 'Verifying\u2026' : 'Verify OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                    Use a different email
                </button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} noValidate>
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>New Password</label>
                <input
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    {...resetForm.register('new_password')}
                    {...f('new_password')}
                />
                {resetForm.formState.errors.new_password && (
                    <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {resetForm.formState.errors.new_password.message}
                    </p>
                )}
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    {...resetForm.register('confirm')}
                    {...f('confirm')}
                />
                {resetForm.formState.errors.confirm && (
                    <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {resetForm.formState.errors.confirm.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                style={btnStyle(loading)}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)'; }}
            >
                {loading ? 'Resetting\u2026' : 'Reset Password'}
            </button>
        </form>
    );

    const renderStep4 = () => (
        <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(34,197,94,0.3)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', color: '#1a2340', margin: '0 0 8px' }}>
                Password Reset Complete
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: '#4b5563', margin: '0 0 24px', lineHeight: 1.5 }}>
                Your password has been updated. You can now sign in with your new password.
            </p>
            <button
                onClick={() => navigate('/login', { replace: true })}
                style={btnStyle(false)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(212,175,55,0.28)'; }}
            >
                Sign In
            </button>
        </div>
    );

    const titles = {
        1: { title: 'Reset Password', subtitle: 'Enter your email to receive a one-time password' },
        2: { title: 'Verify OTP', subtitle: 'Enter the 6-digit code sent to your email' },
        3: { title: 'Create New Password', subtitle: 'Choose a strong password for your account' },
        4: { title: '', subtitle: '' },
    };

    return (
        <AuthLayout title={titles[step].title} subtitle={titles[step].subtitle}>
            {error && <div style={errorBoxStyle}>{error}</div>}
            {success && step !== 4 && <div style={successBoxStyle}>{success}</div>}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {step !== 4 && (
                <p style={{
                    textAlign: 'center', fontSize: '0.83rem', color: '#6b7280',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '20px 0 0',
                }}>
                    Remember your password?{' '}
                    <Link to="/login" style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;
