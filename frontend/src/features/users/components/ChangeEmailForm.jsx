import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

const C = {
    white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6', red: '#B91C1C',
};
const BODY = "'Jost','Inter',sans-serif";

const emailSchema = z.object({
    new_email:        z.string().email('Enter a valid email').toLowerCase().trim(),
    current_password: z.string().min(1, 'Password is required'),
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

const ChangeEmailForm = ({ onSubmit, isPending, serverError }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(emailSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { new_email: '', current_password: '' },
    });

    const submit = (data) => {
        onSubmit(data, { onSuccess: () => reset() });
    };

    return (
        <motion.div
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

            <form onSubmit={handleSubmit(submit)}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>New Email</label>
                        <input {...register('new_email')} type="email" style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = C.gold; }}
                            onBlur={(e) => { e.target.style.borderColor = C.border; }}
                        />
                        {errors.new_email && <p style={errStyle}>{errors.new_email.message}</p>}
                    </div>
                    <div>
                        <label style={labelStyle}>Current Password</label>
                        <input {...register('current_password')} type="password" style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = C.gold; }}
                            onBlur={(e) => { e.target.style.borderColor = C.border; }}
                        />
                        {errors.current_password && <p style={errStyle}>{errors.current_password.message}</p>}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button
                        type="submit"
                        disabled={isPending}
                        style={{
                            padding: '10px 32px', borderRadius: 10, border: 'none',
                            background: C.sapphire, color: '#fff', fontFamily: BODY,
                            fontWeight: 600, fontSize: '0.92rem', cursor: isPending ? 'wait' : 'pointer',
                            opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s',
                        }}
                    >
                        {isPending ? 'Updating…' : 'Update Email'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChangeEmailForm;
