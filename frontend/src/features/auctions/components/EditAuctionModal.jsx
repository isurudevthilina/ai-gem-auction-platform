/**
 * EditAuctionModal.jsx — modal to edit auction end_time / min_bid_increment
 * Only shown to auction owner or admin, for active auctions.
 */
import { useState } from 'react';
import { updateAuction } from '../services/auctionsService';
import { toLocalDateTimeInputValue } from '../utils/auctionState';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8,
    padding: '11px 14px', fontSize: '0.88rem', fontFamily: BODY,
    color: C.text, outline: 'none',
};

const labelStyle = {
    display: 'block', marginBottom: 6,
    fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted,
};

const EditAuctionModal = ({ auction, onClose, onUpdated }) => {
    const [endTime, setEndTime] = useState(toLocalDateTimeInputValue(auction.end_time));
    const [minIncrement, setMinIncrement] = useState(auction.min_bid_increment ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const payload = {};
            if (endTime) payload.end_time = new Date(endTime).toISOString();
            if (minIncrement !== '' && Number(minIncrement) > 0) {
                payload.min_bid_increment = Number(minIncrement);
            }
            if (!Object.keys(payload).length) {
                setError('No changes to save.');
                setSaving(false);
                return;
            }
            const res = await updateAuction(auction.id, payload);
            onUpdated?.(res.data || res);
            onClose();
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('has_bids')) {
                setError('Cannot change bid increment — auction already has bids.');
            } else {
                setError(msg || 'Update failed.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: C.white, borderRadius: 16, padding: '36px 32px 28px',
                maxWidth: 440, width: '90%',
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
            }}>
                <h2 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 700, color: C.text }}>
                    Edit Auction
                </h2>
                <p style={{ margin: '0 0 24px', fontFamily: BODY, fontSize: '0.82rem', color: C.muted }}>
                    Update auction timing and bid settings.
                </p>

                {/* End time */}
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>End Time</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        min={toLocalDateTimeInputValue()}
                        style={inputStyle}
                    />
                </div>

                {/* Min bid increment */}
                <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Min Bid Increment ($)</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={minIncrement}
                        onChange={e => setMinIncrement(e.target.value)}
                        placeholder="e.g. 10"
                        style={inputStyle}
                    />
                    {auction.bid_count > 0 && (
                        <p style={{ margin: '6px 0 0', fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
                            Increment cannot be changed once bids have been placed.
                        </p>
                    )}
                </div>

                {error && (
                    <p style={{ margin: '0 0 16px', fontFamily: BODY, fontSize: '0.82rem', color: C.red, fontWeight: 600 }}>
                        {error}
                    </p>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
                        background: 'none', border: `1.5px solid ${C.border}`, color: C.text,
                        fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600,
                    }}>Cancel</button>
                    <button disabled={saving} onClick={handleSave} style={{
                        padding: '10px 22px', borderRadius: 8, border: 'none',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        background: C.sapphire, color: '#fff',
                        fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600,
                        opacity: saving ? 0.7 : 1,
                    }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAuctionModal;
