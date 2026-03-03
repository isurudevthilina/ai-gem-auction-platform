const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../../config/supabase');
const { authenticate, requireRole, optionalAuth } = require('../../middleware/auth.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auctions
// Public — list auctions with optional filters
// Query params: status, category_id, seller_id, search, page, limit, sort, order
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            status = 'active',
            category_id,
            seller_id,
            search,
            page = 1,
            limit = 12,
            sort = 'end_time',
            order = 'asc',
        } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to   = from + parseInt(limit) - 1;

        let query = supabaseAdmin
            .from('auctions')
            .select(`
                id,
                starting_price,
                current_price,
                min_bid_increment,
                start_time,
                end_time,
                status,
                bid_count,
                created_at,
                winner_id,
                seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url ),
                gem:gems (
                    id, title, carat_weight, cut, clarity, color,
                    origin, image_url, buy_now_price, predicted_price,
                    category:categories ( id, name, slug )
                )
            `, { count: 'exact' })
            .range(from, to)
            .order(sort, { ascending: order === 'asc' });

        if (status && status !== 'all') query = query.eq('status', status);
        if (seller_id)   query = query.eq('seller_id', seller_id);

        const { data, error, count } = await query;

        if (error) {
            console.error('GET /auctions error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        // Client-side search filter (Supabase PostgREST can't filter on nested fields easily)
        let filtered = data || [];
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(a => a.gem?.title?.toLowerCase().includes(q));
        }
        if (category_id) {
            filtered = filtered.filter(a => a.gem?.category?.id === category_id);
        }

        res.json({
            success: true,
            data: filtered,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((count || 0) / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GET /auctions crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auctions/:id
// Public — single auction with top-10 bids
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: auction, error: auctionError } = await supabaseAdmin
            .from('auctions')
            .select(`
                id,
                starting_price,
                current_price,
                min_bid_increment,
                start_time,
                end_time,
                status,
                bid_count,
                created_at,
                winner_id,
                seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url ),
                winner:profiles!auctions_winner_id_fkey ( id, full_name ),
                gem:gems (
                    id, title, description, carat_weight, cut, clarity, color,
                    origin, image_url, buy_now_price, predicted_price,
                    category:categories ( id, name, slug )
                )
            `)
            .eq('id', id)
            .single();

        if (auctionError) {
            if (auctionError.code === 'PGRST116') {
                return res.status(404).json({ success: false, message: 'Auction not found.' });
            }
            return res.status(500).json({ success: false, message: auctionError.message });
        }

        const { data: bids } = await supabaseAdmin
            .from('bids')
            .select(`
                id,
                amount,
                is_winning,
                created_at,
                bidder:profiles!bids_bidder_id_fkey ( id, full_name, avatar_url )
            `)
            .eq('auction_id', id)
            .order('amount', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            data: { ...auction, recent_bids: bids || [] },
        });
    } catch (err) {
        console.error('GET /auctions/:id crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auctions
// Any authenticated user (role check done at dashboard routing level for MVP)
// Body: { gem_id, starting_price, min_bid_increment?, start_time?, end_time }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { gem_id, starting_price, min_bid_increment = 10, start_time, end_time } = req.body;

        const missing = [];
        if (!gem_id)         missing.push('gem_id');
        if (!starting_price) missing.push('starting_price');
        if (!end_time)       missing.push('end_time');
        if (missing.length) {
            return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` });
        }

        if (parseFloat(starting_price) <= 0) {
            return res.status(400).json({ success: false, message: 'starting_price must be > 0.' });
        }

        const endDt   = new Date(end_time);
        const startDt = start_time ? new Date(start_time) : new Date();
        if (isNaN(endDt.getTime())) return res.status(400).json({ success: false, message: 'Invalid end_time.' });
        if (endDt <= startDt) return res.status(400).json({ success: false, message: 'end_time must be after start_time.' });

        // Verify gem ownership
        const { data: gem, error: gemErr } = await supabaseAdmin
            .from('gems')
            .select('id, seller_id, status')
            .eq('id', gem_id)
            .single();

        if (gemErr || !gem) return res.status(404).json({ success: false, message: 'Gem not found.' });
        if (gem.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You can only auction your own gems.' });
        }
        if (gem.status === 'sold') return res.status(400).json({ success: false, message: 'Gem already sold.' });

        // No duplicate active auction
        const { data: existing } = await supabaseAdmin
            .from('auctions')
            .select('id')
            .eq('gem_id', gem_id)
            .eq('status', 'active')
            .maybeSingle();

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An active auction already exists for this gem.',
                existing_auction_id: existing.id,
            });
        }

        const { data: auction, error: insertErr } = await supabaseAdmin
            .from('auctions')
            .insert({
                gem_id,
                seller_id:         req.user.id,
                starting_price:    parseFloat(starting_price),
                current_price:     parseFloat(starting_price),
                min_bid_increment: parseFloat(min_bid_increment),
                start_time:        startDt.toISOString(),
                end_time:          endDt.toISOString(),
                status:            'active',
            })
            .select()
            .single();

        if (insertErr) return res.status(500).json({ success: false, message: insertErr.message });

        await supabaseAdmin.from('gems').update({ status: 'listed' }).eq('id', gem_id);

        res.status(201).json({ success: true, message: 'Auction created.', data: auction });
    } catch (err) {
        console.error('POST /auctions crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auctions/:id
// Seller/Admin — update end_time, min_bid_increment, or cancel
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { end_time, min_bid_increment, status } = req.body;

        const { data: auction, error: fetchErr } = await supabaseAdmin
            .from('auctions')
            .select('id, seller_id, status, bid_count, gem_id')
            .eq('id', id)
            .single();

        if (fetchErr || !auction) return res.status(404).json({ success: false, message: 'Auction not found.' });
        if (auction.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not own this auction.' });
        }
        if (auction.status !== 'active') {
            return res.status(400).json({ success: false, message: `Cannot modify a ${auction.status} auction.` });
        }

        const updates = {};

        if (status === 'cancelled') {
            if (auction.bid_count > 0 && req.user.role !== 'admin') {
                return res.status(400).json({ success: false, message: 'Cannot cancel — bids exist. Contact admin.' });
            }
            updates.status = 'cancelled';
        }

        if (end_time) {
            const dt = new Date(end_time);
            if (isNaN(dt.getTime())) return res.status(400).json({ success: false, message: 'Invalid end_time.' });
            if (dt <= new Date()) return res.status(400).json({ success: false, message: 'end_time must be in the future.' });
            updates.end_time = dt.toISOString();
        }

        if (min_bid_increment !== undefined) {
            if (parseFloat(min_bid_increment) <= 0) {
                return res.status(400).json({ success: false, message: 'min_bid_increment must be > 0.' });
            }
            if (auction.bid_count > 0 && req.user.role !== 'admin') {
                return res.status(400).json({ success: false, message: 'Cannot change increment after bids placed.' });
            }
            updates.min_bid_increment = parseFloat(min_bid_increment);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update.' });
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('auctions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateErr) return res.status(500).json({ success: false, message: updateErr.message });

        // If cancelled, reset gem to draft
        if (updates.status === 'cancelled') {
            await supabaseAdmin.from('gems').update({ status: 'draft' }).eq('id', auction.gem_id);
        }

        res.json({ success: true, message: 'Auction updated.', data: updated });
    } catch (err) {
        console.error('PATCH /auctions/:id crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/auctions/:id
// Seller/Admin — soft-delete (status='cancelled') if no bids
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const { data: auction, error: fetchErr } = await supabaseAdmin
            .from('auctions')
            .select('id, seller_id, status, bid_count, gem_id')
            .eq('id', id)
            .single();

        if (fetchErr || !auction) return res.status(404).json({ success: false, message: 'Auction not found.' });
        if (auction.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not own this auction.' });
        }
        if (auction.status !== 'active') {
            return res.status(400).json({ success: false, message: `Auction is already ${auction.status}.` });
        }
        if (auction.bid_count > 0 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete — bids exist. Contact admin.' });
        }

        await supabaseAdmin.from('auctions').update({ status: 'cancelled' }).eq('id', id);
        await supabaseAdmin.from('gems').update({ status: 'draft' }).eq('id', auction.gem_id);

        res.json({ success: true, message: 'Auction cancelled successfully.' });
    } catch (err) {
        console.error('DELETE /auctions/:id crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
