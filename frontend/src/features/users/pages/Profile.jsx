import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    useGetProfile,
    useUpdateProfile,
    useUpdateAvatar,
    useRequestEmailChangeOTP,
    useChangeEmail,
    useRequestPasswordChangeOTP,
    useChangePassword,
    useDeleteAccount,
} from '../hooks/useProfile';
import ProfileHeader from '../components/ProfileHeader';
import EditProfileForm from '../components/EditProfileForm';
import ChangeEmailForm from '../components/ChangeEmailForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import DangerZone from '../components/DangerZone';
import { useGetMyReviews } from '../../reviews/hooks/useReviews';
import ReviewCard from '../../reviews/components/ReviewCard';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6', red: '#B91C1C',
    green: '#16a34a',
};
const BODY = "'Jost','Inter',sans-serif";
const DISPLAY = "'Cinzel',serif";

/* ─── Toast ─── */
const Toast = ({ message, type, onClose }) => (
    <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 22px', borderRadius: 12, minWidth: 260,
        background: C.white, border: `1px solid ${type === 'error' ? C.red : C.green}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
        fontFamily: BODY, fontSize: '0.9rem', color: type === 'error' ? C.red : C.green,
        animation: 'slideInToast 0.35s ease-out',
    }}>
        <span style={{ flex: 1 }}>{message}</span>
        <button onClick={onClose} style={{
            background: 'none', border: 'none', color: C.muted,
            cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
        }}>&times;</button>
        <style>{`@keyframes slideInToast { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
);

const MyReviewsSection = () => {
    const { data: reviews, isLoading } = useGetMyReviews();
    if (isLoading) return null;
    if (!reviews || reviews.length === 0) return null;
    const shown = reviews.slice(0, 3);
    return (
        <div style={{
            background: C.white, borderRadius: 16, padding: '28px 32px',
            border: `0.5px solid ${C.border}`,
        }}>
            <div style={{
                borderLeft: `3px solid ${C.sapphire}`, paddingLeft: 14,
                marginBottom: 20,
            }}>
                <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire }}>
                    My Reviews
                </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {shown.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
            {reviews.length > 3 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a href="/transactions" style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.gold, textDecoration: 'none', fontWeight: 600 }}>
                        View All →
                    </a>
                </div>
            )}
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { logout, refreshUser } = useAuth();
    const { data: profile, isLoading, error } = useGetProfile();
    const updateProfile = useUpdateProfile();
    const updateAvatar  = useUpdateAvatar();
    const requestEmailOTP = useRequestEmailChangeOTP();
    const changeEmail   = useChangeEmail();
    const requestPasswordOTP = useRequestPasswordChangeOTP();
    const changePassword = useChangePassword();
    const deleteAccount  = useDeleteAccount();

    const [toast, setToast] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* ── Handlers ── */
    const handleProfileUpdate = (data) => {
        updateProfile.mutate(data, {
            onSuccess: () => { showToast('Profile updated.'); refreshUser(); },
            onError: (e) => showToast(e.message || 'Failed to update profile.', 'error'),
        });
    };

    const handleAvatarChange = (file) => {
        updateAvatar.mutate(file, {
            onSuccess: () => { showToast('Avatar updated.'); refreshUser(); },
            onError: (e) => showToast(e.message || 'Failed to upload avatar.', 'error'),
        });
    };

    const handleEmailOTPRequest = (data, opts) => {
        setEmailError('');
        requestEmailOTP.mutate(data, {
            onSuccess: () => { showToast('Verification code sent to your new email.'); opts?.onSuccess?.(); },
            onError: (e) => setEmailError(e.message || 'Failed to send verification code.'),
        });
    };

    const handleEmailChange = (data, opts) => {
        setEmailError('');
        changeEmail.mutate(data, {
            onSuccess: () => { showToast('Email updated.'); opts?.onSuccess?.(); refreshUser(); },
            onError: (e) => setEmailError(e.message || 'Failed to change email.'),
        });
    };

    const handlePasswordOTPRequest = (data, opts) => {
        setPasswordError('');
        requestPasswordOTP.mutate(data, {
            onSuccess: () => { showToast('Verification code sent to your email.'); opts?.onSuccess?.(); },
            onError: (e) => setPasswordError(e.message || 'Failed to send verification code.'),
        });
    };

    const handlePasswordChange = (data, opts) => {
        setPasswordError('');
        changePassword.mutate(data, {
            onSuccess: () => { showToast('Password updated.'); opts?.onSuccess?.(); },
            onError: (e) => setPasswordError(e.message || 'Failed to change password.'),
        });
    };

    const handleDeleteAccount = (data) => {
        setDeleteError('');
        deleteAccount.mutate(data, {
            onSuccess: async () => {
                showToast('Account deleted.');
                await logout();
                navigate('/login');
            },
            onError: (e) => setDeleteError(e.message || 'Failed to delete account.'),
        });
    };

    /* ── Loading / Error states ── */
    if (isLoading) {
        return (
            <div style={{
                minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: BODY, color: C.muted, background: C.bg,
            }}>
                Loading profile…
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: BODY, color: C.red, background: C.bg,
            }}>
                Failed to load profile.
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main style={{ maxWidth: 860, margin: '0 auto', padding: '44px 24px 80px' }}>
                <h1 style={{
                    fontFamily: DISPLAY, fontSize: '1.8rem', fontWeight: 700,
                    color: C.text, margin: '0 0 8px', letterSpacing: '0.02em',
                }}>
                    My Profile
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.92rem', color: C.muted, margin: '0 0 32px' }}>
                    Manage your personal information, email, password, and account settings.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <ProfileHeader
                        profile={profile}
                        onAvatarChange={handleAvatarChange}
                        isUploading={updateAvatar.isPending}
                    />

                    <EditProfileForm
                        profile={profile}
                        onSubmit={handleProfileUpdate}
                        isPending={updateProfile.isPending}
                    />

                    <ChangeEmailForm
                        onRequestOTP={handleEmailOTPRequest}
                        onSubmit={handleEmailChange}
                        isRequesting={requestEmailOTP.isPending}
                        isPending={changeEmail.isPending}
                        serverError={emailError}
                    />

                    <ChangePasswordForm
                        onRequestOTP={handlePasswordOTPRequest}
                        onSubmit={handlePasswordChange}
                        isRequesting={requestPasswordOTP.isPending}
                        isPending={changePassword.isPending}
                        serverError={passwordError}
                    />

                    {profile?.role !== 'seller' && (
                        <DangerZone
                            onDelete={handleDeleteAccount}
                            isPending={deleteAccount.isPending}
                            serverError={deleteError}
                        />
                    )}

                    <MyReviewsSection />
                </div>
            </main>
        </div>
    );
};

export default Profile;
