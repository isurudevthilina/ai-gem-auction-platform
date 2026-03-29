import { Link } from 'react-router-dom';

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

export default function TermsPage() {
    return (
        <div style={{ background: '#FDFAF6', minHeight: '60vh', padding: '48px 24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.6rem', color: '#1A4D8C', marginBottom: 8 }}>
                    Terms of Service
                </h1>
                <p style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', color: '#6B6B7B', marginBottom: 32 }}>
                    Last updated: March 2026
                </p>

                <Section title="1. Acceptance of Terms">
                    By accessing and using the GemBid LK platform, you agree to be bound by these Terms of
                    Service. GemBid LK is a university capstone project and operates as a demonstration
                    marketplace for Sri Lankan gemstones. All transactions conducted on this platform are
                    subject to these terms and applicable laws of Sri Lanka.
                </Section>

                <Section title="2. User Accounts">
                    Users must register with accurate information and maintain the security of their
                    credentials. Sellers must provide valid business identification where required.
                    GemBid LK reserves the right to suspend accounts that violate platform policies
                    or engage in fraudulent activity. Users are responsible for all activity under
                    their account.
                </Section>

                <Section title="3. Listings & Auctions">
                    Sellers are responsible for the accuracy of their gem listings, including carat
                    weight, origin, treatment status, and certification claims. Auction bids are
                    binding once placed. The platform facilitates connections between buyers and
                    sellers but does not guarantee the quality or authenticity of listed items
                    beyond verified certifications.
                </Section>

                <Section title="4. Limitation of Liability">
                    GemBid LK is provided "as is" for educational and demonstration purposes. The
                    platform makes no warranties regarding gem valuations, AI predictions, or
                    transaction outcomes. Users engage in transactions at their own risk. The
                    platform is not liable for disputes between buyers and sellers.
                </Section>

                <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E8E4DC' }}>
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
