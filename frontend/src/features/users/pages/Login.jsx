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

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [focused,  setFocused]  = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [needsVerification, setNeedsVerification] = useState(false);

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { email: location.state?.email ?? '', password: '' },
    });

    const onSubmit = async (values) => {
        setError(null);
        setNeedsVerification(false);
        setLoading(true);
        try {
            await login(values);

            // Route every successful login through one shared role-based dashboard resolver.
            navigate('/dashboard', { replace: true });
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

    const handleResendVerification = async () => {
        try {
            await authService.resendVerification(getValues('email'));
            setError('Verification email sent. Please check your inbox.');
            setNeedsVerification(false);
        } catch {
            setError('Failed to resend verification email.');
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
                    <div style={{
                        marginBottom: '18px',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.22)',
                        color: '#dc2626',
                        fontSize: '0.83rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        lineHeight: 1.5,
                    }}>
                        {error}
                        {needsVerification && (
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                style={{
                                    display: 'block',
                                    marginTop: '8px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#D4AF37',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.82rem',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                            >
                                Resend verification email
                            </button>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '13px',
                        background: loading
                            ? 'rgba(212,175,55,0.45)'
                            : 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
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
                    }}
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
