import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../../shared/components/AuthLayout';

const VerifyEmail = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // OTP-based verification is now done on the login page
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <AuthLayout title="Redirecting..." subtitle="">
            <p style={{ textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6b7280' }}>
                Please enter your verification code on the login page.
            </p>
        </AuthLayout>
    );
};

export default VerifyEmail;
