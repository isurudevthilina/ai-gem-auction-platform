import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../../../shared/components/AuthLayout';
import { useAuth } from '../../../context/AuthContext';
import authService from '../../auth/services/authService';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const fieldStyle = (isFocused, hasError) => ({
    width: '100%',
    padding: '12px 14px',
    background: isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    border: `1.5px solid ${hasError ? '#dc2626' : isFocused ? '#D4AF37' : 'rgba(26,35,64,0.14)'}`,
    borderRadius: '10px',
    fontSize: '0.94rem',
    color: '#1a2340',
    outline: 'none',
    transition: 'all 0.22s',
    boxSizing: 'border-box',
    boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.10)' : isFocused ? '0 0 0 3px rgba(212,175,55,0.14)' : 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const labelStyle = {
    display: 'block',
    fontFamily: "'Cinzel', serif",
    fontSize: '0.67rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#374151',
    marginBottom: '6px',
};

const btnStyle = (loading) => ({
    width: '100%',
    padding: '13px',
    background: loading ? 'rgba(212,175,55,0.45)' : 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
    color: '#1a2340',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.76rem',
    fontWeight: 700,
    fontFamily: "'Cinzel', serif",
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginBottom: '20px',
    boxShadow: loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)',
    transition: 'all 0.22s',
});

const errorBoxStyle = {
    marginBottom: '18px',
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.22)',
    color: '#dc2626',
    fontSize: '0.83rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    lineHeight: 1.5,
};

const successBoxStyle = {
    marginBottom: '18px',
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.22)',
    color: '#16a34a',
    fontSize: '0.83rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    lineHeight: 1.5,
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const from = location.state?.from ?? null;

    const [focused,  setFocused]  = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [success,  setSuccess]  = useState(location.state?.verifyEmail ? 'Account created! Please check your email for a 6-digit verification code.' : null);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [otp, setOtp] = useState('');

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: location.state?.email ?? '', password: '' },
    });

    const onSubmit = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const profile = await login(values);

            const role = profile?.role ?? 'buyer';
            if (from) return navigate(from, { replace: true });
            if (role === 'admin')  return navigate('/admin-dashboard',  { replace: true });
            navigate('/gems', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Sign in failed. Please try again.';
            if (err.response?.status === 403) {
                setNeedsVerification(true);
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await authService.verifyEmail(getValues('email'), otp);
            setSuccess('Email verified! Signing you in...');
            // Auto-login after verification
            const profile = await login({ email: getValues('email'), password: getValues('password') });
            const role = profile?.role ?? 'buyer';
            if (from) return navigate(from, { replace: true });
            if (role === 'admin')  return navigate('/admin-dashboard',  { replace: true });
            navigate('/gems', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setError(null);
            setSuccess(null);
            const result = await authService.resendVerification(getValues('email'));
            setSuccess(result.message || 'Verification code sent. Please check your inbox.');
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Failed to resend verification code.');
        }
    };

    const f = (key) => ({
        style: fieldStyle(focused === key, !!errors[key]),
        onFocus: () => setFocused(key),
        onBlur:  () => setFocused(null),
    });

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your GemBid LK account">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...register('email')}
                        {...f('email')}
                    />
                    {errors.email && (
                        <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        placeholder="Your password"
                        autoComplete="current-password"
                        {...register('password')}
                        {...f('password')}
                    />
                    {errors.password && (
                        <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {error && (
                    <div style={errorBoxStyle}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={successBoxStyle}>
                        {success}
                    </div>
                )}

                {needsVerification && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Verification Code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            style={fieldStyle(focused === 'otp', false)}
                            onFocus={() => setFocused('otp')}
                            onBlur={() => setFocused(null)}
                        />
                        <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Enter the 6-digit code from your email.
                            {' '}
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                style={{
                                    background: 'none', border: 'none', color: '#D4AF37',
                                    fontWeight: 700, cursor: 'pointer', padding: 0,
                                    fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                            >
                                Resend code
                            </button>
                        </p>
                        <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            style={{
                                ...btnStyle(loading || otp.length !== 6),
                                marginTop: '12px',
                                marginBottom: '0',
                            }}
                            onMouseEnter={e => {
                                if (!loading && otp.length === 6) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = '';
                                e.currentTarget.style.boxShadow = (loading || otp.length !== 6) ? 'none' : '0 4px 18px rgba(212,175,55,0.28)';
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                    </div>
                )}

                <div style={{ textAlign: 'right', marginBottom: 12 }}>
                    <Link
                        to="/forgot-password"
                        state={from ? { from } : undefined}
                        style={{
                            background: 'none', border: 'none', color: '#D4AF37',
                            fontWeight: 700, cursor: 'pointer', padding: 0,
                            fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                            textDecoration: 'none',
                        }}
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={btnStyle(loading)}
                    onMouseEnter={e => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)';
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)';
                    }}
                >
                    {loading ? 'Signing in\u2026' : 'Sign In'}
                </button>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.83rem',
                    color: '#6b7280',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    margin: 0,
                }}>
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/signup"
                        state={from ? { from } : undefined}
                        style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}
                    >
                        Create Account
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;
