const FONT_DISPLAY = "'Cinzel', serif";

export default function PageLoader() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FDFAF6',
            position: 'relative',
        }}>
            {/* Gem outline with pulse */}
            <svg
                width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="#C4892A" strokeWidth="1.2" strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'gemPulse 2s ease-in-out infinite' }}
            >
                <path d="M6 3h12l4 6-10 13L2 9z"/>
                <path d="M11 3l1 10"/>
                <path d="M2 9h20"/>
                <path d="M6 3l6 6 6-6"/>
            </svg>

            <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#1A4D8C',
                marginTop: 20,
            }}>
                GemBid LK
            </span>

            {/* Thin loading bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: '#E8E4DC',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #C4892A, #D4AF37, #C4892A)',
                    animation: 'loadBar 1.5s ease-in-out infinite',
                }} />
            </div>

            <style>{`
                @keyframes gemPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                @keyframes loadBar {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 40%; margin-left: 30%; }
                    100% { width: 0%; margin-left: 100%; }
                }
            `}</style>
        </div>
    );
}
