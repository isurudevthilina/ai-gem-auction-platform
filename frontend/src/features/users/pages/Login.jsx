import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../../shared/components/AuthLayout';
import { useTheme } from '../../../context/ThemeContext';

const Login = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [focusedField, setFocusedField] = useState(null);

    const inputWrapperStyle = (isFocused) => ({
        marginBottom: '32px',
        borderBottom: `2.5px solid ${isFocused ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')}`,
        transition: 'all 0.3s',
        position: 'relative',
    });

    const labelStyle = {
        fontSize: '0.8rem',
        color: isDark ? '#94a3b8' : '#64748b',
        fontWeight: 600,
        marginBottom: '4px',
        display: 'block'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 0',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        color: isDark ? '#f1f5f9' : '#1e1b4b',
        fontWeight: 500,
    };

    const socialBtnStyle = (colors) => ({
        width: '100%',
        padding: '12px',
        background: isDark ? 'rgba(255,255,255,0.03)' : `linear-gradient(90deg, ${colors})`,
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        borderRadius: '6px',
        color: isDark ? '#f1f5f9' : 'white',
        fontSize: '0.85rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        marginBottom: '12px',
        transition: 'all 0.2s',
    });

    return (
        <AuthLayout
            title="Sign In"
            subtitle="Enter your details to access your GemBid account"
        >
            <form onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
                <div style={inputWrapperStyle(focusedField === 'email')}>
                    <label style={labelStyle}>Email Address</label>
                    <input
                        type="email"
                        placeholder="yourname@email.com"
                        style={inputStyle}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                    />
                </div>

                <div style={inputWrapperStyle(focusedField === 'pass')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>Password</label>
                        <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>Forgot?</Link>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        style={inputStyle}
                        onFocus={() => setFocusedField('pass')}
                        onBlur={() => setFocusedField(null)}
                        required
                    />
                </div>

                <button type="submit" style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 25px rgba(245, 158, 11, 0.35)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.25)'; }}
                >
                    CONTINUE
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '24px', fontWeight: 500 }}>
                    or Connect with Social Media
                </p>

                <div style={{ marginBottom: '32px' }}>
                    <button type="button" style={socialBtnStyle('#38bdf8, #0ea5e9')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                        Twitter
                    </button>
                    <button type="button" style={socialBtnStyle('#3b82f6, #2563eb')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.946v-3.447h2.946v-2.543c0-2.922 1.785-4.513 4.391-4.513 1.248 0 2.322.093 2.634.135v3.054h-1.808c-1.419 0-1.693.675-1.693 1.663v2.19h3.38l-.441 3.447h-2.939v8.74h6.052c.732 0 1.325-.593 1.325-1.325v-21.351c0-.732-.593-1.325-1.325-1.325z" /></svg>
                        Facebook
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Don't have an account? </span>
                    <Link to="/signup" style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800, textDecoration: 'none' }}>
                        Sign Up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
