const DISPLAY = "'Cinzel',serif";

const STATUS_MAP = {
    pending:  { bg: '#FAC775', color: '#633806', text: 'Pending Review' },
    verified: { bg: '#9FE1CB', color: '#085041', text: 'Verified' },
    rejected: { bg: '#F7C1C1', color: '#791F1F', text: 'Rejected' },
};

const CertificateStatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 20,
            background: s.bg,
            color: s.color,
            fontFamily: DISPLAY,
            fontSize: '0.6rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            lineHeight: 1.6,
        }}>
            {s.text}
        </span>
    );
};

export default CertificateStatusBadge;
