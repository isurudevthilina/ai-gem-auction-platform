import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../../shared/components/AuthLayout';
import { useTheme } from '../../../context/ThemeContext';
import { supabase } from '../../../config/supabase';

const Signup = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [role, setRole] = useState('buyer');
    const [focusedField, setFocusedField] = useState(null);
    const [fullName,  setFullName]  = useState('');
    const [email,     setEmail]     = useState('');
    const [password,  setPassword]  = useState('');
    const [confirm,   setConfirm]   = useState('');
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) return setError('Passwords do not match.');
        if (password.length < 6)  return setError('Password must be at least 6 characters.');
        setLoading(true);
        try {
            const { data, error: signUpErr } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role } },
            });
            if (signUpErr) throw signUpErr;
            // Supabase may need email confirmation — navigate based on role
            navigate(role === 'seller' ? '/seller-dashboard' : '/buyer-dashboard');
        } catch (err) {
            setError(err.message ?? 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputWrapperStyle = (isFocused) => ({
        marginBottom: '24px',
        background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
        border: `1.5px solid ${isFocused ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')}`,
        borderRadius: '12px',
        padding: '8px 16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isFocused ? '0 0 0 4px rgba(245, 158, 11, 0.1)' : 'none',
    });

    const labelStyle = {
        fontSize: '0.85rem',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontWeight: 700,
        marginBottom: '10px',
        display: 'block',
        textAlign: 'center',
        letterSpacing: '0.025em'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 0',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '0.95rem',
        color: isDark ? '#f1f5f9' : '#1e1b4b',
        fontWeight: 500,
        textAlign: role === 'address' ? 'left' : 'center', // Address is a textarea
    };

    return (
        <AuthLayout
            title="Create Account"
            welcomeText="Join the GemBid Marketplace"
            welcomeSub="Start your journey in the world's most trusted gemstone auction platform"
        >
            <form onSubmit={handleSubmit}>

                {/* Role Switcher */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ ...labelStyle, textAlign: 'center', marginBottom: '15px' }}>I want to...</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                            { id: 'buyer', label: 'Buy Gems', icon: '💎' },
                            { id: 'seller', label: 'Sell Gems', icon: '🤝' }
                        ].map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setRole(item.id)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '10px',
                                    background: role === item.id
                                        ? (isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb')
                                        : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                                    border: `2px solid ${role === item.id ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb')}`,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: role === item.id ? '0 4px 15px rgba(245, 158, 11, 0.15)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    color: role === item.id ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b')
                                }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Full Name</label>
                    <div style={inputWrapperStyle(focusedField === 'name')}>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            style={inputStyle}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Email Address</label>
                    <div style={inputWrapperStyle(focusedField === 'email')}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Password</label>
                    <div style={inputWrapperStyle(focusedField === 'pass')}>
                        <input
                            type="password"
                            placeholder="Create a password (min. 6 characters)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                            onFocus={() => setFocusedField('pass')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={inputWrapperStyle(focusedField === 'confirmPass')}>
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            style={inputStyle}
                            onFocus={() => setFocusedField('confirmPass')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={inputWrapperStyle(focusedField === 'phone')}>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            style={inputStyle}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.82rem' }}>
                        {error}
                    </div>
                )}
                <button type="submit" disabled={loading} style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '10px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(245, 158, 11, 0.35)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.25)'; }}
                >
                    {loading ? 'Creating account…' : 'CONTINUE'}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                </button>

                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>Already have an account? </span>
                    <Link to="/login" style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Signup;
