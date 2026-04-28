/**
 * StepReview.jsx — Step 3: read-only summary + submit actions
 */
import { Box, Sparkles } from 'lucide-react';
import { T, SERIF, DISPLAY, BODY, labelStyle } from '../formTokens';
import { useCurrency } from '../../../../context/CurrencyContext';
import { formatLKR } from '../../../../shared/utils/currency';

const StepReview = ({ getValues, imageFiles, imagePreviews }) => {
    const { formatPrice } = useCurrency();
    const v = getValues();

    const certDisplay = v.certification_body
        ? `${v.certification_body}${v.certification ? ' · ' + v.certification : ''}`
        : (v.certification || '—');

    const summaryRows = [
        { label: 'Gem Type',      value: v.gem_type },
        { label: 'Title',         value: v.title },
        { label: 'Carat Weight',  value: v.carat_weight ? `${v.carat_weight} ct` : '—' },
        { label: 'Color',         value: v.color || '—' },
        { label: 'Clarity',       value: v.clarity || '—' },
        { label: 'Cut / Shape',   value: v.cut || '—' },
        { label: 'Treatment',     value: v.treatment || '—' },
        { label: 'Dimensions',    value: (v.x && v.y && v.z) ? `${v.x} × ${v.y} × ${v.z} mm` : '—' },
        { label: 'Certification', value: certDisplay },
        { label: 'Listing Type',  value: v.listing_type === 'direct_sell' ? 'Direct Sale' : 'Auction' },
    ];
    if (v.listing_type === 'direct_sell' && v.buy_now_price) {
        summaryRows.push({ label: 'Buy Now Price', value: formatPrice(v.buy_now_price) });
    }
    if (v.predicted_price) {
        summaryRows.push({ label: 'AI Estimate', value: formatLKR(v.predicted_price) });
    }

    return (
        <div>
            <div style={{ borderLeft: `3px solid ${T.sapphire}`, paddingLeft: 24, marginBottom: 32 }}>
                <h2 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 700, color: T.text }}>Review & Submit</h2>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.85rem', color: T.muted }}>Confirm all details before saving your listing.</p>
            </div>

            {/* Summary card */}
            <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderRadius: 12, padding: 28, marginBottom: 24 }}>
                {summaryRows.map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `0.5px solid ${T.border}` }}>
                        <span style={{ fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted }}>{label}</span>
                        <span style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600, color: T.text, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                    </div>
                ))}

                {v.description && (
                    <div style={{ marginTop: 16 }}>
                        <span style={{ ...labelStyle, marginBottom: 8 }}>Description</span>
                        <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.84rem', color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{v.description}</p>
                    </div>
                )}
            </div>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <span style={labelStyle}>{imagePreviews.length} File{imagePreviews.length > 1 ? 's' : ''}</span>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                        {imagePreviews.map((src, i) => {
                            const file = imageFiles[i];
                            const ext = file?.name?.split('.').pop()?.toLowerCase() || '';
                            const is3D = ['glb', 'gltf'].includes(ext);
                            const isFirstPhoto = !is3D && i === imageFiles.findIndex(f => !['glb', 'gltf'].includes(f.name.split('.').pop()?.toLowerCase()));
                            return (
                                <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: isFirstPhoto ? `2px solid ${T.gold}` : `0.5px solid ${T.border}` }}>
                                    {is3D ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.sapphireBg }}>
                                            <Box size={20} color={T.sapphire} />
                                            <span style={{ fontSize: '0.55rem', fontFamily: BODY, color: T.muted, fontWeight: 600, textTransform: 'uppercase' }}>.{ext}</span>
                                        </div>
                                    ) : (
                                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: T.goldSoft, borderRadius: 10, border: `0.5px solid rgba(196,137,42,0.2)`, marginBottom: 8 }}>
                <Sparkles size={18} color={T.gold} />
                <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: T.gold, fontWeight: 600 }}>
                    AI Valuation: Pending — will appear after listing is saved
                </span>
            </div>
        </div>
    );
};

export default StepReview;
