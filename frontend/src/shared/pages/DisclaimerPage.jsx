import { Link } from 'react-router-dom';

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

export default function DisclaimerPage() {
    return (
        <div style={{ background: '#FDFAF6', minHeight: '60vh', padding: '48px 24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.6rem', color: '#1A4D8C', marginBottom: 8 }}>
                    Disclaimer
                </h1>
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', color: '#6B6B7B', marginBottom: 32 }}>
                    Last updated: March 2026
                </p>

                <Section title="Academic Project Notice">
                    GemBid LK is a university capstone project developed for educational and
                    demonstration purposes. While the platform implements real-world marketplace
                    functionality, it is not a commercially licensed gem trading platform. Any
                    transactions conducted are at the users' own discretion and risk.
                </Section>

                <Section title="AI Valuation Disclaimer">
                    The AI-powered gem valuation feature provides estimated prices based on
                    machine learning models trained on historical market data. These predictions
                    are for informational purposes only and should not be considered professional
                    appraisals. Actual gem values may differ significantly from AI estimates.
                    Users should consult certified gemologists for authoritative valuations.
                </Section>

                <Section title="Certification & Authenticity">
                    While GemBid LK provides a certification verification system, the platform
                    does not independently verify the authenticity of gemstones. Sellers are
                    responsible for providing accurate descriptions and legitimate certification
                    documents. Buyers are advised to perform due diligence before making
                    purchase decisions.
                </Section>

                <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E8E4DC', display: 'flex', gap: 24 }}>
                    <Link to="/terms" style={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: '#C4892A', textDecoration: 'none' }}>
                        Terms of Service →
                    </Link>
                    <Link to="/privacy" style={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: '#C4892A', textDecoration: 'none' }}>
                        Privacy Policy →
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
