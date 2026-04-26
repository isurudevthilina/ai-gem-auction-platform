import { Link } from 'react-router-dom';

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

export default function PrivacyPage() {
    return (
        <div style={{ background: '#FDFAF6', minHeight: '60vh', padding: '48px 24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.6rem', color: '#1A4D8C', marginBottom: 8 }}>
                    Privacy Policy
                </h1>
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', color: '#6B6B7B', marginBottom: 32 }}>
                    Last updated: March 2026
                </p>

                <Section title="1. Information We Collect">
                    GemBid LK collects information you provide during registration, including your
                    name, email address, and business details for seller accounts. We also collect
                    usage data such as browsing activity, search queries, and transaction history
                    to improve the platform experience. Gem listing data including images and
                    specifications are stored to facilitate marketplace operations.
                </Section>

                <Section title="2. How We Use Your Information">
                    Your information is used to provide and maintain platform services, process
                    transactions, verify seller identities, and deliver notifications about bids
                    and auctions. AI valuation data may be used to improve our prediction models.
                    We do not sell personal information to third parties. Analytics data helps us
                    understand usage patterns and improve the platform.
                </Section>

                <Section title="3. Data Security">
                    We implement industry-standard security measures including encrypted data
                    transmission (HTTPS), secure authentication via Supabase, and role-based
                    access controls. Sensitive information such as NIC numbers and business
                    registration details are stored securely and never exposed through public
                    API endpoints. However, no system is completely secure and we cannot
                    guarantee absolute security.
                </Section>

                <Section title="4. Your Rights">
                    You may access, update, or delete your personal information through your
                    profile settings. You may request a complete data export or account deletion
                    by contacting our team. Seller public profiles display only business-relevant
                    information and never expose personal contact details to other users without
                    consent.
                </Section>

                <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E8E4DC' }}>
                    <Link to="/terms" style={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: '#C4892A', textDecoration: 'none' }}>
                        Terms of Service →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: '1rem', color: '#1A4D8C', marginBottom: 8 }}>
                {title}
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: '#4A4A5A', lineHeight: 1.7 }}>
                {children}
            </p>
        </div>
    );
}
