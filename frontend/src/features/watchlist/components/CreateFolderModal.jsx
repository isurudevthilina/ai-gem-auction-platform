import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
    red: '#B91C1C',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const schema = z.object({
    name: z.string().trim().min(1, 'Folder name is required').max(60, 'Maximum 60 characters'),
});

const CreateFolderModal = ({ isOpen, onClose, mode = 'create', folder, onSubmit }) => {
    const [serverError, setServerError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: mode === 'rename' && folder ? folder.name : '' },
    });

    const nameValue = watch('name', '');

    useEffect(() => {
        if (isOpen) {
            reset({ name: mode === 'rename' && folder ? folder.name : '' });
            setServerError('');
        }
    }, [isOpen, mode, folder, reset]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const doSubmit = async (data) => {
        try {
            setServerError('');
            await onSubmit(data.name);
        } catch (err) {
            setServerError(err?.message || 'Something went wrong');
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.88rem',
        color: C.text, outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div onClick={(e) => e.stopPropagation()} style={{
                background: C.white, borderRadius: 16, padding: 32,
                width: '100%', maxWidth: 420,
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
                <h2 style={{
                    margin: '0 0 20px', fontFamily: DISPLAY, fontSize: '1.1rem',
                    fontWeight: 700, color: C.text,
                }}>
                    {mode === 'create' ? 'New Folder' : 'Rename Folder'}
                </h2>

                <form onSubmit={handleSubmit(doSubmit)}>
                    <label style={{
                        display: 'block', marginBottom: 6, fontFamily: DISPLAY,
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: C.muted,
                    }}>
                        Folder Name
                    </label>
                    <input
                        {...register('name')}
                        autoFocus
                        placeholder="e.g. Blue Sapphires"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = C.gold}
                        onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                    <div style={{
                        fontFamily: BODY, fontSize: '0.72rem', color: C.faint,
                        textAlign: 'right', marginTop: 4,
                    }}>
                        {nameValue.length} / 60
                    </div>

                    {errors.name && (
                        <p style={{ margin: '4px 0 0', fontFamily: BODY, fontSize: '0.78rem', color: C.red }}>
                            {errors.name.message}
                        </p>
                    )}
                    {serverError && (
                        <p style={{ margin: '4px 0 0', fontFamily: BODY, fontSize: '0.78rem', color: C.red }}>
                            {serverError}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'transparent', border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: '10px 24px', fontFamily: BODY,
                            fontWeight: 600, color: C.muted, cursor: 'pointer', fontSize: '0.88rem',
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{
                            background: C.sapphire, border: 'none', borderRadius: 10,
                            padding: '10px 24px', fontFamily: BODY, fontWeight: 600,
                            color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '0.88rem', opacity: isSubmitting ? 0.7 : 1,
                        }}>
                            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
