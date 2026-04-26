import { useState, useEffect } from 'react';
import { getMyGems } from '../../gems/services/gemsService';
import ListingRow from './ListingRow';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const TABS = [
    { key: 'all',        label: 'All' },
    { key: 'draft',      label: 'Draft' },
    { key: 'listed',     label: 'Listed' },
    { key: 'in_auction', label: 'In Auction' },
    { key: 'sold',       label: 'Sold' },
];

const MyListings = () => {
    const [gems, setGems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');

    const fetchGems = async () => {
        setLoading(true);
        try {
            const res = await getMyGems();
            setGems(res?.data || []);
        } catch (err) {
            console.error('MyListings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGems(); }, []);

    const filtered = tab === 'all' ? gems : gems.filter(g => g.status === tab);
    const countFor = (key) => key === 'all' ? gems.length : gems.filter(g => g.status === key).length;

    const headers = ['Cover', 'Title & Details', 'Status', 'Price', 'Date', 'Actions'];
    const gridCols = '60px 1fr 110px 100px 110px 130px';

    if (loading) {
        return (
            <div>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        background: C.white, borderRadius: 12, height: 64, marginBottom: 10,
                        border: `1px solid ${C.border}`,
                        animation: 'shimmer 1.5s infinite',
                    }} />
                ))}
                <style>{`@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
                {TABS.map(({ key, label }) => {
                    const active = tab === key;
                    const count = countFor(key);
                    return (
                        <button key={key} onClick={() => setTab(key)} style={{
                            padding: '10px 18px', border: 'none', cursor: 'pointer',
                            background: 'transparent',
                            borderBottom: active ? `2px solid ${C.gold}` : '2px solid transparent',
                            color: active ? C.gold : C.faint,
                            fontFamily: BODY, fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            {label}
                            <span style={{
                                padding: '1px 7px', borderRadius: 20,
                                background: active ? C.goldLight : `rgba(0,0,0,0.04)`,
                                fontSize: '0.68rem', fontWeight: 700,
                                color: active ? C.gold : C.faint,
                            }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Header row ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: gridCols, gap: 12,
                padding: '10px 16px', marginBottom: 6,
            }}>
                {headers.map(h => (
                    <div key={h} style={{
                        fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700,
                        color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</div>
                ))}
            </div>

            {/* ── Rows ── */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '48px 0',
                    background: C.white, borderRadius: 14,
                    border: `1px solid ${C.border}`,
                }}>
                    <div style={{ fontFamily: BODY, fontSize: '0.9rem', color: C.muted, fontWeight: 600, marginBottom: 6 }}>
                        {tab === 'draft' ? 'No drafts. Start listing a gem.' : `No gems in this status.`}
                    </div>
                    {tab === 'draft' && (
                        <button onClick={() => window.location.href = '/gems/new'} style={{
                            marginTop: 10, padding: '8px 22px', borderRadius: 8,
                            background: C.gold, color: '#fff', border: 'none',
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        }}>List New Gem</button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filtered.map(gem => (
                        <ListingRow key={gem.id} gem={gem} onRefresh={fetchGems} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;
