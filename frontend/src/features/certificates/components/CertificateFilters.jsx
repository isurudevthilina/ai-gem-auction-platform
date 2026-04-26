const C = {
    sapphire: '#1A4D8C', white: '#FFFFFF', muted: '#6B6B7B',
    border: '#E0DCD6', bg: '#F0EDE8',
};
const BODY = "'Jost','Inter',sans-serif";

const STATUSES = [
    { key: 'pending', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
];

const LABS = ['GIA', 'AGS', 'IGI', 'GRS', 'GIT', 'GGTL', 'Gübelin', 'Other'];

const SORTS = [
    { value: 'oldest', label: 'Oldest First' },
    { value: 'newest', label: 'Newest First' },
    { value: 'updated', label: 'Recently Updated' },
];

const CertificateFilters = ({ filters, onChange, stats }) => {
    const handleStatus = (status) => onChange({ ...filters, status, page: 0 });
    const handleLab = (e) => {
        const val = e.target.value || null;
        onChange({ ...filters, issued_by: val, page: 0 });
    };
    const handleSort = (e) => onChange({ ...filters, sort: e.target.value, page: 0 });

    const getCount = (key) => {
        if (!stats) return '';
        if (key === 'all') return stats.total ?? '';
        return stats[key] ?? '';
    };

    const selectStyle = {
        padding: '8px 12px',
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: C.white,
        fontFamily: BODY,
        fontSize: '0.78rem',
        color: C.muted,
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
        }}>
            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
                {STATUSES.map(s => {
                    const active = filters.status === s.key;
                    return (
                        <button key={s.key} onClick={() => handleStatus(s.key)} style={{
                            padding: '7px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: active ? C.sapphire : 'transparent',
                            color: active ? C.white : C.muted,
                            fontFamily: BODY,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}>
                            {s.label}{stats ? ` (${getCount(s.key)})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Lab + Sort */}
            <div style={{ display: 'flex', gap: 10 }}>
                <select value={filters.issued_by || ''} onChange={handleLab} style={selectStyle}>
                    <option value="">All Labs</option>
                    {LABS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select value={filters.sort} onChange={handleSort} style={selectStyle}>
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>
        </div>
    );
};

export default CertificateFilters;
