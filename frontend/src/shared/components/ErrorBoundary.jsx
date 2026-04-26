import { Component } from 'react';

const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const isDev = import.meta.env.DEV;

        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FDFAF6',
                padding: 24,
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: 460,
                    background: '#fff',
                    borderRadius: 16,
                    padding: '48px 36px',
                    boxShadow: '0 8px 32px rgba(26,26,46,0.08)',
                    border: '1px solid #E8E4DC',
                }}>
                    {/* Gem icon */}
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                        stroke="#C4892A" strokeWidth="1.5" strokeLinecap="round"
                        strokeLinejoin="round" style={{ marginBottom: 20 }}>
                        <path d="M6 3h12l4 6-10 13L2 9z"/>
                        <path d="M11 3l1 10"/>
                        <path d="M2 9h20"/>
                        <path d="M6 3l6 6 6-6"/>
                    </svg>

                    <h1 style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: '1.4rem',
                        color: '#1A4D8C',
                        marginBottom: 8,
                    }}>
                        Something Went Wrong
                    </h1>
                    <p style={{
                        fontFamily: FONT_BODY,
                        fontSize: '0.9rem',
                        color: '#6B6B7B',
                        lineHeight: 1.6,
                        marginBottom: isDev ? 16 : 28,
                    }}>
                        An unexpected error occurred. Please try again.
                    </p>

                    {isDev && this.state.error && (
                        <pre style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: '#ef4444',
                            background: '#fef2f2',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 28,
                            textAlign: 'left',
                            overflowX: 'auto',
                            maxHeight: 120,
                        }}>
                            {this.state.error.message || String(this.state.error)}
                        </pre>
                    )}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button
                            onClick={this.handleReset}
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
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={this.handleGoHome}
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
                                cursor: 'pointer',
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
