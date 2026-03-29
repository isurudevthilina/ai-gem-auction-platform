const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

export default function EmptyState({
    icon,
    title = 'Nothing here yet',
    description = '',
    action,
    secondAction,
    size = 'md',
}) {
    const sizes = {
        sm: { iconSize: 36, titleSize: '1rem', descSize: '0.82rem', pad: 24 },
        md: { iconSize: 48, titleSize: '1.2rem', descSize: '0.88rem', pad: 40 },
        lg: { iconSize: 56, titleSize: '1.4rem', descSize: '0.92rem', pad: 56 },
    };
    const s = sizes[size] || sizes.md;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: s.pad,
            textAlign: 'center',
        }}>
            {icon && (
                <div style={{ marginBottom: 16, color: '#C4892A', opacity: 0.7 }}>
                    {typeof icon === 'function'
                        ? icon({ size: s.iconSize, strokeWidth: 1.2 })
                        : icon}
                </div>
            )}

            <h3 style={{
                fontFamily: FONT_DISPLAY,
                fontSize: s.titleSize,
                color: '#1A4D8C',
                marginBottom: 6,
                fontWeight: 600,
            }}>
                {title}
            </h3>

            {description && (
                <p style={{
                    fontFamily: FONT_BODY,
                    fontSize: s.descSize,
                    color: '#6B6B7B',
                    lineHeight: 1.5,
                    maxWidth: 360,
                    marginBottom: (action || secondAction) ? 20 : 0,
                }}>
                    {description}
                </p>
            )}

            {(action || secondAction) && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {action && (
                        <button
                            onClick={action.onClick}
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                padding: '10px 22px',
                                background: 'linear-gradient(135deg, #C4892A 0%, #B07824 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                            }}
                        >
                            {action.label}
                        </button>
                    )}
                    {secondAction && (
                        <button
                            onClick={secondAction.onClick}
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                padding: '10px 22px',
                                background: 'transparent',
                                color: '#1A4D8C',
                                border: '1.5px solid #1A4D8C',
                                borderRadius: 10,
                                cursor: 'pointer',
                            }}
                        >
                            {secondAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
