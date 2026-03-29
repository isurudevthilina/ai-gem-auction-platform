import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, User, Gem } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

const FONT_SERIF = "'Cormorant Garamond', serif";
const FONT_DISPLAY = "'Cinzel', serif";
const FONT_BODY = "'Jost', sans-serif";

const POPULAR_SEARCHES = ['Sapphire', 'Ruby', 'Emerald', 'Ceylon', 'Padparadscha', 'Unheated'];

const RECENT_KEY = 'gembid_recent_searches';
const getRecent = () => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
    catch { return []; }
};
const addRecent = (term) => {
    const list = getRecent().filter(t => t !== term);
    list.unshift(term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
};

export default function GlobalSearchModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const { query, setQuery, gems, sellers, isLoading, hasResults } = useGlobalSearch();
    const [recent] = useState(getRecent);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen, setQuery]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const go = (path, term) => {
        if (term) addRecent(term);
        onClose();
        navigate(path);
    };

    if (!isOpen) return null;

    const showIdle = query.length < 2;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '12vh',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 600,
                    background: '#fff', borderRadius: 16,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                    maxHeight: '70vh', display: 'flex', flexDirection: 'column',
                }}
            >
                {/* Search input */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 20px',
                    borderBottom: '1px solid #E8E4DC',
                }}>
                    <Search size={20} color="#6B6B7B" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search gems, sellers..."
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            fontFamily: FONT_SERIF, fontSize: '1.15rem',
                            color: '#1A1A2E', background: 'transparent',
                        }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6B6B7B' }}>
                            <X size={18} />
                        </button>
                    )}
                    <kbd style={{
                        fontFamily: FONT_BODY, fontSize: '0.65rem',
                        padding: '2px 6px', borderRadius: 4,
                        background: '#F5EFE6', color: '#6B6B7B',
                        border: '1px solid #E8E4DC',
                    }}>ESC</kbd>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', padding: '12px 0' }}>
                    {showIdle ? (
                        <div style={{ padding: '8px 20px' }}>
                            {recent.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6B7B' }}>
                                        Recent Searches
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                        {recent.map((t) => (
                                            <button key={t} onClick={() => setQuery(t)}
                                                style={{
                                                    fontFamily: FONT_BODY, fontSize: '0.82rem',
                                                    padding: '5px 14px', borderRadius: 99,
                                                    background: '#F5EFE6', color: '#1A4D8C',
                                                    border: '1px solid #E8E4DC', cursor: 'pointer',
                                                }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <span style={{ fontFamily: FONT_DISPLAY, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6B7B' }}>
                                    Popular
                                </span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                    {POPULAR_SEARCHES.map((t) => (
                                        <button key={t} onClick={() => setQuery(t)}
                                            style={{
                                                fontFamily: FONT_BODY, fontSize: '0.82rem',
                                                padding: '5px 14px', borderRadius: 99,
                                                background: 'rgba(196,137,42,0.08)', color: '#C4892A',
                                                border: '1px solid rgba(196,137,42,0.2)', cursor: 'pointer',
                                            }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Gems results */}
                            {gems.length > 0 && (
                                <div>
                                    <div style={{ padding: '4px 20px 8px', fontFamily: FONT_DISPLAY, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6B7B' }}>
                                        Gems
                                    </div>
                                    {gems.map((gem) => (
                                        <button key={gem.id}
                                            onClick={() => go(`/gem/${gem.id}`, query)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                width: '100%', padding: '10px 20px',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                textAlign: 'left', transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5EFE6'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                        >
                                            {gem.images?.[0] ? (
                                                <img src={gem.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gem size={18} color="#6B6B7B" />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: FONT_SERIF, fontSize: '0.95rem', color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {gem.title}
                                                </div>
                                                <div style={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: '#6B6B7B' }}>
                                                    {gem.carat_weight}ct · {gem.category?.name || gem.color}
                                                </div>
                                            </div>
                                            {gem.buy_now_price && (
                                                <span style={{ fontFamily: FONT_BODY, fontSize: '0.82rem', fontWeight: 600, color: '#1A4D8C' }}>
                                                    ${gem.buy_now_price.toLocaleString()}
                                                </span>
                                            )}
                                            <ArrowRight size={14} color="#6B6B7B" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Sellers results */}
                            {sellers.length > 0 && (
                                <div>
                                    <div style={{ padding: '12px 20px 8px', fontFamily: FONT_DISPLAY, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6B7B' }}>
                                        Sellers
                                    </div>
                                    {sellers.map((s) => (
                                        <button key={s.id}
                                            onClick={() => go(`/sellers/${s.id}`, query)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                width: '100%', padding: '10px 20px',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                textAlign: 'left', transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5EFE6'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                                        >
                                            {s.avatar_url ? (
                                                <img src={s.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={16} color="#6B6B7B" />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: FONT_SERIF, fontSize: '0.92rem', color: '#1A1A2E' }}>
                                                    {s.full_name}
                                                </div>
                                                {s.business_name && (
                                                    <div style={{ fontFamily: FONT_BODY, fontSize: '0.72rem', color: '#6B6B7B' }}>
                                                        {s.business_name}
                                                    </div>
                                                )}
                                            </div>
                                            {s.is_verified && (
                                                <span style={{
                                                    fontFamily: FONT_BODY, fontSize: '0.65rem', fontWeight: 600,
                                                    padding: '2px 8px', borderRadius: 99,
                                                    background: 'rgba(26,122,80,0.1)', color: '#1A7A50',
                                                }}>Verified</span>
                                            )}
                                            <ArrowRight size={14} color="#6B6B7B" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No results */}
                            {!isLoading && !hasResults && query.length >= 2 && (
                                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                                    <p style={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: '#6B6B7B' }}>
                                        No results for "{query}"
                                    </p>
                                    <button
                                        onClick={() => go(`/gems?search=${encodeURIComponent(query)}`, query)}
                                        style={{
                                            fontFamily: FONT_BODY, fontSize: '0.82rem',
                                            color: '#C4892A', background: 'none', border: 'none',
                                            cursor: 'pointer', marginTop: 8, textDecoration: 'underline',
                                        }}
                                    >
                                        Browse all gems →
                                    </button>
                                </div>
                            )}

                            {/* View all link */}
                            {hasResults && (
                                <div style={{ padding: '8px 20px 4px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => go(`/gems?search=${encodeURIComponent(query)}`, query)}
                                        style={{
                                            fontFamily: FONT_BODY, fontSize: '0.82rem',
                                            color: '#C4892A', background: 'none', border: 'none',
                                            cursor: 'pointer', textDecoration: 'underline',
                                        }}
                                    >
                                        View all results →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
