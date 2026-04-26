/**
 * GemImageGallery.jsx — Main image viewer with thumbnail strip, lightbox, and 3D model support.
 * Images array may contain `model:` prefixed URLs for 3D files.
 */
import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Box, Maximize2 } from 'lucide-react';
import Gem3DViewer from './Gem3DViewer';

const T = {
    bg:       '#F0EDE8',
    white:    '#FFFFFF',
    sapphire: '#1A4D8C',
    gold:     '#C4892A',
    text:     '#1A1A2E',
    muted:    '#6B6B7B',
    faint:    '#9A9AAB',
    border:   '#E0DCD6',
};
const BODY = "'Jost', 'Inter', sans-serif";

/** Parse images array — separate photos from 3D model URLs */
const parseImages = (images = []) => {
    const entries = [];
    for (const url of images) {
        if (typeof url === 'string' && url.startsWith('model:')) {
            entries.push({ type: '3d', url: url.slice(6) });
        } else {
            entries.push({ type: 'photo', url });
        }
    }
    return entries;
};

/* ─── Lightbox overlay ─── */
const Lightbox = ({ entry, onClose, onPrev, onNext, hasPrev, hasNext }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.88)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        }}
    >
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="#fff" />
        </button>

        {hasPrev && (
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronLeft size={24} color="#fff" />
            </button>
        )}
        {hasNext && (
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={24} color="#fff" />
            </button>
        )}

        <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '85vw', maxHeight: '85vh', width: '100%', height: '80vh' }}>
            {entry.type === '3d' ? (
                <Gem3DViewer modelUrl={entry.url} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            ) : (
                <img src={entry.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, display: 'block', margin: '0 auto' }} />
            )}
        </div>
    </div>
);

/* ════════════════════════════════════════════════════════════════
   GEM IMAGE GALLERY
════════════════════════════════════════════════════════════════ */
const GemImageGallery = ({ images = [] }) => {
    const entries = parseImages(images);
    const [selected, setSelected] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const current = entries[selected] || entries[0];
    const hasMultiple = entries.length > 1;

    const goPrev = useCallback(() => setSelected(i => (i > 0 ? i - 1 : entries.length - 1)), [entries.length]);
    const goNext = useCallback(() => setSelected(i => (i < entries.length - 1 ? i + 1 : 0)), [entries.length]);

    if (!entries.length) {
        return (
            <div style={{
                width: '100%', height: 400, borderRadius: 14, background: T.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `0.5px solid ${T.border}`,
            }}>
                <span style={{ fontFamily: BODY, fontSize: '0.88rem', color: T.faint }}>No images available</span>
            </div>
        );
    }

    return (
        <div>
            {/* Main viewer */}
            <div style={{ position: 'relative', width: '100%', height: 420, borderRadius: 14, overflow: 'hidden', background: '#0a0a14', border: `0.5px solid ${T.border}` }}>
                {current.type === '3d' ? (
                    <Gem3DViewer modelUrl={current.url} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <img src={current.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}

                {/* Expand button */}
                <button onClick={() => setLightboxOpen(true)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Maximize2 size={14} color="#fff" />
                    <span style={{ fontFamily: BODY, fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Expand</span>
                </button>

                {/* 3D badge */}
                {current.type === '3d' && (
                    <span style={{ position: 'absolute', top: 12, left: 12, background: T.sapphire, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, fontFamily: BODY, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Box size={12} /> 3D MODEL
                    </span>
                )}

                {/* Navigation arrows */}
                {hasMultiple && (
                    <>
                        <button onClick={goPrev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <ChevronLeft size={18} color="#fff" />
                        </button>
                        <button onClick={goNext} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <ChevronRight size={18} color="#fff" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {hasMultiple && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {entries.map((entry, i) => (
                        <button key={i} onClick={() => setSelected(i)} style={{
                            width: 64, height: 64, minWidth: 64, borderRadius: 8, overflow: 'hidden',
                            border: i === selected ? `2px solid ${T.sapphire}` : `1px solid ${T.border}`,
                            cursor: 'pointer', padding: 0, background: 'none', opacity: i === selected ? 1 : 0.7,
                            transition: 'all 0.2s',
                        }}>
                            {entry.type === '3d' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,77,140,0.08)' }}>
                                    <Box size={18} color={T.sapphire} />
                                    <span style={{ fontSize: '0.5rem', fontFamily: BODY, color: T.muted, fontWeight: 700, marginTop: 2 }}>3D</span>
                                </div>
                            ) : (
                                <img src={entry.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox
                    entry={current}
                    onClose={() => setLightboxOpen(false)}
                    onPrev={goPrev}
                    onNext={goNext}
                    hasPrev={entries.length > 1}
                    hasNext={entries.length > 1}
                />
            )}
        </div>
    );
};

export default GemImageGallery;
