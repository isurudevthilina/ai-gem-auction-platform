import { Link } from 'react-router-dom';

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

export default function NotFoundPage() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FDFAF6',
            padding: 24,
        }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                {/* Gem SVG outline */}
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                    stroke="#C4892A" strokeWidth="1" strokeLinecap="round"
                    strokeLinejoin="round" style={{ marginBottom: 24, opacity: 0.6 }}>
                    <path d="M6 3h12l4 6-10 13L2 9z"/>
                    <path d="M11 3l1 10"/>
                    <path d="M2 9h20"/>
                    <path d="M6 3l6 6 6-6"/>
                </svg>

                <h1 style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: '1.6rem',
                    color: '#1A4D8C',
                    marginBottom: 10,
                }}>
                    Page Not Found
                </h1>
                <p style={{
                    fontFamily: FONT_BODY,
                    fontSize: '0.9rem',
                    color: '#6B6B7B',
                    lineHeight: 1.6,
                    marginBottom: 32,
                }}>
                    The gem you're looking for has already been sold, or may never have existed.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Link
                        to="/gems"
                        style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '11px 24px',
                            background: 'linear-gradient(135deg, #C4892A 0%, #B07824 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            textDecoration: 'none',
                        }}
                    >
                        Browse Gems
                    </Link>
                    <Link
                        to="/"
                        style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '11px 24px',
                            background: 'transparent',
                            color: '#1A4D8C',
                            border: '1.5px solid #1A4D8C',
                            borderRadius: 10,
                            textDecoration: 'none',
                        }}
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
