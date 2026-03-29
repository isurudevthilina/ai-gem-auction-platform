import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

const C = {
    white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6', red: '#B91C1C',
};
const BODY = "'Jost','Inter',sans-serif";

const schema = z.object({
    full_name:     z.string().trim().min(2, 'Min 2 characters').max(60).optional().or(z.literal('')),
    phone_number:  z.string().optional().or(z.literal('')),
    district:      z.string().max(60).optional().or(z.literal('')),
    province:      z.string().max(60).optional().or(z.literal('')),
    city:          z.string().max(60).optional().or(z.literal('')),
    address_line1: z.string().max(120).optional().or(z.literal('')),
    address_line2: z.string().max(120).optional().or(z.literal('')),
    postal_code:   z.string().max(10).optional().or(z.literal('')),
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

const Field = ({ label, name, register, errors, type = 'text', disabled }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input
            {...register(name)}
            type={type}
            disabled={disabled}
            style={{ ...inputStyle, ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
            onFocus={(e) => { e.target.style.borderColor = C.gold; }}
            onBlur={(e) => { e.target.style.borderColor = C.border; }}
        />
        {errors[name] && <p style={errStyle}>{errors[name].message}</p>}
    </div>
);

const EditProfileForm = ({ profile, onSubmit, isPending }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            full_name:     profile?.full_name || '',
            phone_number:  profile?.phone_number || '',
            district:      profile?.district || '',
            province:      profile?.province || '',
            city:          profile?.city || '',
            address_line1: profile?.address_line1 || '',
            address_line2: profile?.address_line2 || '',
            postal_code:   profile?.postal_code || '',
        },
    });

    const submit = (data) => {
        // Only send changed fields
        const patch = {};
        for (const [key, val] of Object.entries(data)) {
            if (val !== (profile?.[key] || '')) patch[key] = val;
        }
        if (Object.keys(patch).length > 0) onSubmit(patch);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            style={{
                background: C.white, borderRadius: 16, padding: '28px 36px',
                border: `1px solid ${C.border}`,
            }}
        >
            <h2 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '1.15rem',
                color: C.text, margin: '0 0 20px', letterSpacing: '0.02em',
            }}>
                Personal Information
            </h2>

            <form onSubmit={handleSubmit(submit)}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    <Field label="Full Name" name="full_name" register={register} errors={errors} />
                    <Field label="Phone Number" name="phone_number" register={register} errors={errors} />
                    <Field label="Province" name="province" register={register} errors={errors} />
                    <Field label="District" name="district" register={register} errors={errors} />
                    <Field label="City" name="city" register={register} errors={errors} />
                    <Field label="Postal Code" name="postal_code" register={register} errors={errors} />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Address Line 1" name="address_line1" register={register} errors={errors} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Address Line 2" name="address_line2" register={register} errors={errors} />
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
                        {isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EditProfileForm;
