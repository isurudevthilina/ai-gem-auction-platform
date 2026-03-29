/**
 * StepListingDetails.jsx — Step 2: description, certification, images, 3D model, listing type
 */
import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Upload, X, Box, ShoppingBag, Gavel, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { T, SERIF, DISPLAY, BODY, inputBase, labelStyle, focusRing } from '../formTokens';
import FieldError from '../FieldError';

const StepListingDetails = ({ register, control, errors, watch, imageFiles, setImageFiles, imagePreviews, setImagePreviews }) => {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const listingType = watch('listing_type');

    const addFiles = (files) => {
        const remaining = 10 - imageFiles.length;
        const toAdd = Array.from(files).slice(0, remaining);
        const newFiles = [...imageFiles, ...toAdd];
        setImageFiles(newFiles);
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
    };

    const removeImage = (idx) => {
        URL.revokeObjectURL(imagePreviews[idx]);
        setImageFiles(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };

    return (
        <div>
            <div style={{ borderLeft: `3px solid ${T.sapphire}`, paddingLeft: 24, marginBottom: 32 }}>
                <h2 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 700, color: T.text }}>Listing Details</h2>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.85rem', color: T.muted }}>Add description, certification, images, and choose your listing type.</p>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Description</label>
                <textarea {...register('description')} rows={5}
                    placeholder="Describe the gem's appearance, provenance, and any notable characteristics. (Min 50 characters)"
                    style={{ ...inputBase, resize: 'vertical', minHeight: 120, borderColor: errors.description ? T.error : T.border }}
                    onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                    onBlur={e => { register('description').onBlur(e); e.target.style.borderColor = errors.description ? T.error : T.border; e.target.style.boxShadow = 'none'; }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <FieldError message={errors.description?.message} />
                    <span style={{ fontSize: '0.72rem', color: T.faint, fontFamily: BODY }}>{(watch('description') || '').length}/5000</span>
                </div>
            </div>

            {/* Certification */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Certification</label>
                <input {...register('certification')} placeholder="e.g. GIA 2141438071"
                    style={{ ...inputBase, maxWidth: 400 }}
                    onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
                />
                <div style={{
                    marginTop: 12, padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(26,77,140,0.05)', border: `1px solid rgba(26,77,140,0.12)`,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                    <Shield size={16} color={T.sapphire} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontFamily: BODY, fontSize: '0.8rem', color: T.text, fontWeight: 600, marginBottom: 4 }}>
                            Upload your certificate PDF after saving
                        </div>
                        <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: T.muted, lineHeight: 1.5 }}>
                            Once this gem is saved, you can upload the full certificate PDF from your{' '}
                            <Link to="/seller-dashboard" style={{ color: T.sapphire, fontWeight: 600, textDecoration: 'none' }}>
                                Seller Dashboard → Certificates
                            </Link>.
                            An admin will verify it and a "Certified" badge will appear on your listing.
                        </div>
                    </div>
                </div>
            </div>

            {/* Image + 3D Upload */}
            <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Photos & 3D Model (up to 10 — first photo is cover)</label>
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? T.sapphire : T.border}`,
                        borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer',
                        background: dragOver ? T.sapphireBg : 'transparent',
                        transition: 'all 0.2s',
                    }}>
                    <Upload size={28} color={dragOver ? T.sapphire : T.faint} style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.85rem', color: T.muted }}>
                        Drag & drop files here, or <span style={{ color: T.sapphire, fontWeight: 600 }}>browse</span>
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: T.faint, fontFamily: BODY }}>
                        JPG, PNG, WebP for photos — GLB for 3D model — max 10 files
                    </p>
                    <input ref={fileInputRef} type="file" accept="image/*,.glb,.gltf" multiple hidden
                        onChange={e => { if (e.target.files.length) addFiles(e.target.files); e.target.value = ''; }} />
                </div>

                {/* Preview grid */}
                {imagePreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
                        {imagePreviews.map((src, idx) => {
                            const file = imageFiles[idx];
                            const ext = file?.name?.split('.').pop()?.toLowerCase() || '';
                            const is3D = ['glb', 'gltf'].includes(ext);
                            const isFirstPhoto = !is3D && idx === imageFiles.findIndex(f => !['glb', 'gltf'].includes(f.name.split('.').pop()?.toLowerCase()));
                            return (
                                <div key={idx} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: isFirstPhoto ? `2px solid ${T.gold}` : `0.5px solid ${T.border}`, aspectRatio: '1' }}>
                                    {is3D ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.sapphireBg }}>
                                            <Box size={32} color={T.sapphire} />
                                            <span style={{ marginTop: 6, fontSize: '0.65rem', fontFamily: BODY, color: T.muted, fontWeight: 600, textTransform: 'uppercase' }}>.{ext} 3D</span>
                                        </div>
                                    ) : (
                                        <img src={src} alt={`Preview ${idx + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    )}
                                    {isFirstPhoto && (
                                        <span style={{ position: 'absolute', top: 6, left: 6, background: T.gold, color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontFamily: DISPLAY, letterSpacing: '0.06em' }}>COVER</span>
                                    )}
                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                        style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Listing Type Toggle */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Listing Type *</label>
                <Controller name="listing_type" control={control} render={({ field }) => (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <button type="button" onClick={() => field.onChange('direct_sell')}
                            style={{
                                padding: 24, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                background: field.value === 'direct_sell' ? T.sapphireBg : T.white,
                                border: field.value === 'direct_sell' ? `2px solid ${T.sapphire}` : `0.5px solid ${T.border}`,
                                transition: 'all 0.2s',
                            }}>
                            <ShoppingBag size={24} color={field.value === 'direct_sell' ? T.sapphire : T.faint} style={{ marginBottom: 12 }} />
                            <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, color: T.text, marginBottom: 6 }}>Direct Sale</div>
                            <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.78rem', color: T.muted, lineHeight: 1.5 }}>
                                Set a fixed Buy Now price. Buyer purchases immediately.
                            </p>
                        </button>
                        <button type="button" onClick={() => field.onChange('auction')}
                            style={{
                                padding: 24, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                background: field.value === 'auction' ? T.sapphireBg : T.white,
                                border: field.value === 'auction' ? `2px solid ${T.sapphire}` : `0.5px solid ${T.border}`,
                                transition: 'all 0.2s',
                            }}>
                            <Gavel size={24} color={field.value === 'auction' ? T.sapphire : T.faint} style={{ marginBottom: 12 }} />
                            <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, color: T.text, marginBottom: 6 }}>Auction</div>
                            <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.78rem', color: T.muted, lineHeight: 1.5 }}>
                                Start a live bid. Highest bidder wins when time runs out.
                            </p>
                        </button>
                    </div>
                )} />
            </div>

            {/* Conditional: Buy Now Price */}
            {listingType === 'direct_sell' && (
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Buy Now Price (USD) *</label>
                    <div style={{ position: 'relative', maxWidth: 300 }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: BODY, fontSize: '0.88rem', color: T.muted, fontWeight: 600 }}>$</span>
                        <input {...register('buy_now_price')} type="number" min="1" step="0.01" placeholder="0.00"
                            style={{ ...inputBase, paddingLeft: 28, borderColor: errors.buy_now_price ? T.error : T.border }}
                            onFocus={e => { e.target.style.borderColor = T.borderFocus; Object.assign(e.target.style, focusRing); }}
                            onBlur={e => { register('buy_now_price').onBlur(e); e.target.style.borderColor = errors.buy_now_price ? T.error : T.border; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <FieldError message={errors.buy_now_price?.message} />
                </div>
            )}

            {listingType === 'auction' && (
                <div style={{ padding: '14px 18px', background: T.goldSoft, borderRadius: 10, border: `0.5px solid rgba(196,137,42,0.2)` }}>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.82rem', color: T.gold, fontWeight: 600, lineHeight: 1.6 }}>
                        You will set auction details (start price, reserve, duration) in the next step after saving this listing.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StepListingDetails;
