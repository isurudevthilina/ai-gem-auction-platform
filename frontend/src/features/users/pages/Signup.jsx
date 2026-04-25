import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../../../shared/components/AuthLayout';
import authService from '../../auth/services/authService';

const SL_PROVINCES = [
    'Western Province', 'Central Province', 'Southern Province',
    'Northern Province', 'Eastern Province', 'North Western Province',
    'North Central Province', 'Uva Province', 'Sabaragamuwa Province',
];

const SL_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
];

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
const slPhoneRegex = /^(\+94|0)[0-9]{9}$/;
const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

const signupSchema = z.object({
    role: z.enum(['buyer', 'seller']),
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone_number: z.string().optional().refine(
        (v) => !v || slPhoneRegex.test(v),
        'Invalid Sri Lankan phone number',
    ),
    district: z.string().min(1, 'Please select your district'),
    province: z.string().min(1, 'Please select your province'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(passwordRegex, 'Must include uppercase, lowercase, number, and special character'),
    confirm: z.string().min(1, 'Please confirm your password'),
    nic_number: z.string().optional(),
    business_name: z.string().optional(),
    business_registration_number: z.string().optional(),
    business_address: z.string().optional(),
}).refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
}).refine((data) => data.role !== 'seller' || (data.nic_number && nicRegex.test(data.nic_number)), {
    message: 'Valid NIC number is required for sellers',
    path: ['nic_number'],
}).refine((data) => data.role !== 'seller' || !!data.business_registration_number, {
    message: 'Business registration number is required for sellers',
    path: ['business_registration_number'],
});

const fieldStyle = (isFocused, hasError) => ({
    width: '100%', padding: '11px 14px',
    background: isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
    border: `1.5px solid ${hasError ? '#dc2626' : isFocused ? '#D4AF37' : 'rgba(26,35,64,0.14)'}`,
    borderRadius: '10px', fontSize: '0.92rem', color: '#1a2340',
    outline: 'none', transition: 'all 0.22s', boxSizing: 'border-box',
    boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.10)' : isFocused ? '0 0 0 3px rgba(212,175,55,0.14)' : 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const labelStyle = {
    display: 'block', fontFamily: "'Cinzel', serif",
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#374151', marginBottom: '6px',
};

const Field = ({ label, children }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
);

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from ?? null;

    const [focused, setFocused] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            role: 'buyer', full_name: '', email: '', phone_number: '',
            district: '', province: '', password: '', confirm: '',
            nic_number: '', business_name: '', business_registration_number: '',
            business_address: '',
        },
    });

    const role = watch('role');
    const password = watch('password');

    // Password strength indicator
    const getPasswordStrength = (pw) => {
        if (!pw) return { level: 0, label: '', color: 'transparent' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[@$!%*?&]/.test(pw)) score++;
        if (score <= 2) return { level: score, label: 'Weak', color: '#dc2626' };
        if (score <= 3) return { level: score, label: 'Fair', color: '#f59e0b' };
        if (score <= 4) return { level: score, label: 'Good', color: '#3b82f6' };
        return { level: score, label: 'Strong', color: '#22c55e' };
    };
    const strength = getPasswordStrength(password);

    const onSubmit = async (values) => {
        setError(null);
        setLoading(true);
        try {
            await authService.register({
                email: values.email,
                password: values.password,
                full_name: values.full_name,
                role: values.role,
                phone_number: values.phone_number || undefined,
                district: values.district,
                province: values.province,
                nic_number: values.role === 'seller' ? values.nic_number : undefined,
                business_name: values.role === 'seller' ? (values.business_name || undefined) : undefined,
                business_registration_number: values.role === 'seller' ? values.business_registration_number : undefined,
                business_address: values.role === 'seller' ? (values.business_address || undefined) : undefined,
            });

            navigate('/login', {
                replace: true,
                state: { email: values.email, from },
            });
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Sign up failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const f = (key) => ({
        style: fieldStyle(focused === key, !!errors[key]),
        onFocus: () => setFocused(key),
        onBlur:  () => setFocused(null),
    });

    return (
        <AuthLayout title="Create Account" subtitle="Join Sri Lanka's premier gemstone marketplace" maxWidth={520}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Role selector */}
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ ...labelStyle, marginBottom: '10px', textAlign: 'center' }}>I want to</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                            { id: 'buyer',  label: 'Buy Gems'  },
                            { id: 'seller', label: 'Sell Gems' },
                        ].map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => setValue('role', id)}
                                style={{
                                    flex: 1, padding: '14px 10px', borderRadius: '12px',
                                    background: role === id ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.5)',
                                    border: `2px solid ${role === id ? '#D4AF37' : 'rgba(26,35,64,0.12)'}`,
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    boxShadow: role === id ? '0 4px 14px rgba(212,175,55,0.18)' : 'none',
                                }}>
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', fontWeight: 700,
                                    letterSpacing: '0.08em', color: role === id ? '#B8942E' : '#4b5563' }}>
                                    {label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Common fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Full Name">
                            <input type="text" placeholder="Chamara Perera" autoComplete="name"
                                {...register('full_name')} {...f('full_name')} />
                            {errors.full_name && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.full_name.message}</p>}
                        </Field>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Email Address">
                            <input type="email" placeholder="you@example.com" autoComplete="email"
                                {...register('email')} {...f('email')} />
                            {errors.email && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.email.message}</p>}
                        </Field>
                    </div>
                    <Field label="Phone Number">
                        <input type="tel" placeholder="07X XXXXXXX" autoComplete="tel"
                            {...register('phone_number')} {...f('phone_number')} />
                        {errors.phone_number && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.phone_number.message}</p>}
                    </Field>
                    <div />
                    <Field label="District">
                        <select {...register('district')}
                            onFocus={() => setFocused('district')} onBlur={() => setFocused(null)}
                            style={{ ...fieldStyle(focused === 'district', !!errors.district), appearance: 'none', cursor: 'pointer' }}>
                            <option value="">Select District</option>
                            {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.district && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.district.message}</p>}
                    </Field>
                    <Field label="Province">
                        <select {...register('province')}
                            onFocus={() => setFocused('province')} onBlur={() => setFocused(null)}
                            style={{ ...fieldStyle(focused === 'province', !!errors.province), appearance: 'none', cursor: 'pointer' }}>
                            <option value="">Select Province</option>
                            {SL_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errors.province && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.province.message}</p>}
                    </Field>
                </div>

                {/* Seller fields */}
                {role === 'seller' && (
                    <div style={{ marginTop: '4px', paddingTop: '16px', borderTop: '1px solid rgba(212,175,55,0.25)' }}>
                        <p style={{ ...labelStyle, color: '#B8942E', marginBottom: '14px', textAlign: 'center', fontSize: '0.62rem' }}>
                            Seller Identity &amp; Business Details
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                            <Field label="NIC Number">
                                <input type="text" placeholder="XXXXXXXXXX0V"
                                    {...register('nic_number')} {...f('nic_number')} />
                                {errors.nic_number && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.nic_number.message}</p>}
                            </Field>
                            <Field label="Business Name">
                                <input type="text" placeholder="Gem Traders (Pvt) Ltd"
                                    {...register('business_name')} {...f('business_name')} />
                            </Field>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Business Registration No.">
                                    <input type="text" placeholder="PV123456"
                                        {...register('business_registration_number')} {...f('business_registration_number')} />
                                    {errors.business_registration_number && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.business_registration_number.message}</p>}
                                </Field>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Business Address">
                                    <textarea placeholder="No. 12, Gem Street, Ratnapura" rows={2}
                                        {...register('business_address')}
                                        onFocus={() => setFocused('business_address')} onBlur={() => setFocused(null)}
                                        style={{ ...fieldStyle(focused === 'business_address', false), resize: 'none', lineHeight: 1.5 }} />
                                </Field>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginTop: '4px' }}>
                    <Field label="Password">
                        <input type="password" placeholder="Min. 8 characters" autoComplete="new-password"
                            {...register('password')} {...f('password')} />
                        {errors.password && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.password.message}</p>}
                        {password && (
                            <div style={{ marginTop: '6px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} style={{
                                            flex: 1, height: '3px', borderRadius: '2px',
                                            background: i <= strength.level ? strength.color : 'rgba(26,35,64,0.12)',
                                            transition: 'background 0.2s',
                                        }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.7rem', color: strength.color, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    {strength.label}
                                </p>
                            </div>
                        )}
                    </Field>
                    <Field label="Confirm Password">
                        <input type="password" placeholder="Re-enter password" autoComplete="new-password"
                            {...register('confirm')} {...f('confirm')} />
                        {errors.confirm && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '3px' }}>{errors.confirm.message}</p>}
                    </Field>
                </div>

                {error && (
                    <div style={{
                        marginBottom: '16px', padding: '11px 14px', borderRadius: '10px',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                        color: '#dc2626', fontSize: '0.82rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5,
                    }}>
                        {error}
                    </div>
                )}

                <button type="submit" disabled={loading}
                    style={{
                        width: '100%', padding: '13px',
                        background: loading ? 'rgba(212,175,55,0.45)' : 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
                        color: '#1a2340', border: 'none', borderRadius: '10px',
                        fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Cinzel', serif",
                        letterSpacing: '0.13em', textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '4px', marginBottom: '20px',
                        boxShadow: loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)',
                        transition: 'all 0.22s',
                    }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,175,55,0.38)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(212,175,55,0.28)'; }}
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.83rem', color: '#6b7280', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                    Already have an account?{' '}
                    <Link to="/login" state={from ? { from } : undefined}
                        style={{ color: '#D4AF37', fontWeight: 700, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
