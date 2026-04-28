import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion as Motion } from 'framer-motion';

const C = {
    white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6', red: '#B91C1C',
};
const BODY = "'Jost','Inter',sans-serif";

const emailSchema = z.object({
    new_email:        z.string().email('Enter a valid email').toLowerCase().trim(),
    current_password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'Enter the 6 digit code').regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.92rem',
    color: C.text, background: '#FAFAF8', outline: 'none',
    transition: 'border-color 0.2s',
};
const labelStyle = {
    display: 'block', fontFamily: BODY, fontWeight: 600,
    fontSize: '0.82rem', color: C.muted, marginBottom: 4,
};
const errStyle = { fontFamily: BODY, fontSize: '0.78rem', color: C.red, marginTop: 2 };

const ChangeEmailForm = ({ onRequestOTP, onSubmit, isRequesting, isPending, serverError }) => {
    const [requestedEmail, setRequestedEmail] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
    } = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { new_email: '', current_password: '' },
    });
    const {
        register: registerOTP,
        handleSubmit: handleOTPSubmit,
        formState: { errors: otpErrors },
        reset: resetOTP,
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const requestCode = (data) => {
        onRequestOTP(data, {
            onSuccess: () => {
                setRequestedEmail(data.new_email);
                resetOTP({ otp: '' });
            },
        });
    };

    const resendCode = () => {
        const values = getValues();
        requestCode(values);
    };

    const confirmChange = ({ otp }) => {
        onSubmit({ new_email: requestedEmail, otp }, {
            onSuccess: () => {
                reset();
                resetOTP();
                setRequestedEmail('');
            },
        });
    };

    return (
        <Motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            style={{
                background: C.white, borderRadius: 16, padding: '28px 36px',
                border: `1px solid ${C.border}`,
            }}
        >
            <h2 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '1.15rem',
                color: C.text, margin: '0 0 20px', letterSpacing: '0.02em',
            }}>
                Change Email
            </h2>

            {serverError && (
                <p style={{ ...errStyle, marginBottom: 12 }}>{serverError}</p>
            )}

            <form onSubmit={handleSubmit(requestCode)}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>New Email</label>
                        <input {...register('new_email')} type="email" style={inputStyle}
                            disabled={!!requestedEmail}
                            onFocus={(e) => { e.target.style.borderColor = C.gold; }}
                            onBlur={(e) => { e.target.style.borderColor = C.border; }}
                        />
                        {errors.new_email && <p style={errStyle}>{errors.new_email.message}</p>}
                    </div>
                    <div>
                        <label style={labelStyle}>Current Password</label>
                        <input {...register('current_password')} type="password" style={inputStyle}
                            disabled={!!requestedEmail}
                            onFocus={(e) => { e.target.style.borderColor = C.gold; }}
                            onBlur={(e) => { e.target.style.borderColor = C.border; }}
                        />
                        {errors.current_password && <p style={errStyle}>{errors.current_password.message}</p>}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button
                        type="submit"
                        disabled={isRequesting || !!requestedEmail}
                        style={{
                            padding: '10px 32px', borderRadius: 10, border: 'none',
                            background: C.sapphire, color: '#fff', fontFamily: BODY,
                            fontWeight: 600, fontSize: '0.92rem', cursor: isRequesting || requestedEmail ? 'wait' : 'pointer',
                            opacity: isRequesting || requestedEmail ? 0.6 : 1, transition: 'opacity 0.2s',
                        }}
                    >
                        {isRequesting ? 'Sending Code…' : requestedEmail ? 'Code Sent' : 'Send OTP'}
                    </button>
                </div>
            </form>

            {requestedEmail && (
                <form onSubmit={handleOTPSubmit(confirmChange)} style={{
                    marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}`,
                }}>
                    <p style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, margin: '0 0 14px' }}>
                        Enter the 6 digit code sent to <strong>{requestedEmail}</strong>. The code expires in 15 minutes.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) auto auto', gap: 12, alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>Email OTP</label>
                            <input {...registerOTP('otp')} type="text" inputMode="numeric" maxLength={6} style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = C.gold; }}
                                onBlur={(e) => { e.target.style.borderColor = C.border; }}
                            />
                            {otpErrors.otp && <p style={errStyle}>{otpErrors.otp.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isPending}
                            style={{
                                padding: '10px 20px', borderRadius: 10, border: 'none',
                                background: C.sapphire, color: '#fff', fontFamily: BODY,
                                fontWeight: 600, fontSize: '0.9rem', cursor: isPending ? 'wait' : 'pointer',
                                opacity: isPending ? 0.6 : 1,
                            }}
                        >
                            {isPending ? 'Verifying…' : 'Confirm Email'}
                        </button>
                        <button
                            type="button"
                            disabled={isRequesting}
                            onClick={resendCode}
                            style={{
                                padding: '10px 16px', borderRadius: 10,
                                border: `1px solid ${C.border}`, background: '#fff',
                                color: C.text, fontFamily: BODY, fontWeight: 600,
                                fontSize: '0.9rem', cursor: isRequesting ? 'wait' : 'pointer',
                            }}
                        >
                            Resend
                        </button>
                    </div>
                    <button type="button" onClick={() => { setRequestedEmail(''); resetOTP(); }}
                        style={{ marginTop: 12, border: 'none', background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: BODY, fontSize: '0.82rem' }}>
                        Use a different email
                    </button>
                </form>
            )}
        </Motion.div>
    );
};

export default ChangeEmailForm;
