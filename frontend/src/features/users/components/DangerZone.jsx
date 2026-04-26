import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

const C = {
    white: '#FFFFFF', red: '#B91C1C', text: '#1A1A2E',
    muted: '#6B6B7B', border: '#E0DCD6',
};
const BODY = "'Jost','Inter',sans-serif";

const deleteSchema = z.object({
    current_password: z.string().min(1, 'Password is required'),
});

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.92rem',
    color: C.text, background: '#FAFAF8', outline: 'none',
};
const labelStyle = {
    display: 'block', fontFamily: BODY, fontWeight: 600,
    fontSize: '0.82rem', color: C.muted, marginBottom: 4,
};
const errStyle = { fontFamily: BODY, fontSize: '0.78rem', color: C.red, marginTop: 2 };

const DangerZone = ({ onDelete, isPending, serverError }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(deleteSchema),
        defaultValues: { current_password: '' },
    });

    const submit = (data) => {
        onDelete(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26 }}
            style={{
                background: C.white, borderRadius: 16, padding: '28px 36px',
                border: `1.5px solid ${C.red}20`,
            }}
        >
            <h2 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '1.15rem',
                color: C.red, margin: '0 0 8px', letterSpacing: '0.02em',
            }}>
                Danger Zone
            </h2>
            <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, margin: '0 0 18px' }}>
                Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    style={{
                        padding: '10px 28px', borderRadius: 10,
                        border: `1.5px solid ${C.red}`, background: 'transparent',
                        color: C.red, fontFamily: BODY, fontWeight: 600,
                        fontSize: '0.92rem', cursor: 'pointer',
                    }}
                >
                    Delete My Account
                </button>
            ) : (
                <form onSubmit={handleSubmit(submit)}>
                    {serverError && (
                        <p style={{ ...errStyle, marginBottom: 12 }}>{serverError}</p>
                    )}
                    <div style={{ maxWidth: 360, marginBottom: 16 }}>
                        <label style={labelStyle}>Enter your password to confirm</label>
                        <input {...register('current_password')} type="password" style={inputStyle} />
                        {errors.current_password && <p style={errStyle}>{errors.current_password.message}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            type="submit"
                            disabled={isPending}
                            style={{
                                padding: '10px 28px', borderRadius: 10, border: 'none',
                                background: C.red, color: '#fff', fontFamily: BODY,
                                fontWeight: 600, fontSize: '0.92rem',
                                cursor: isPending ? 'wait' : 'pointer',
                                opacity: isPending ? 0.6 : 1,
                            }}
                        >
                            {isPending ? 'Deleting…' : 'Confirm Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowConfirm(false); reset(); }}
                            style={{
                                padding: '10px 28px', borderRadius: 10,
                                border: `1px solid ${C.border}`, background: 'transparent',
                                color: C.muted, fontFamily: BODY, fontWeight: 600,
                                fontSize: '0.92rem', cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );
};

export default DangerZone;
