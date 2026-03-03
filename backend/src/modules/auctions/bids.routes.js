const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent
const { supabaseAdmin } = require('../../config/supabase');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auctions/:id/bids
// Authenticated buyer — place a bid via the atomic place_bid() RPC
// Body: { amount }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const auction_id = req.params.id;
        const { amount }  = req.body;

        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ success: false, message: 'Valid bid amount is required.' });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Bid amount must be positive.' });
        }

        // Call atomic Postgres RPC — handles validation, locking, insert, price update
        const { data: result, error } = await supabaseAdmin.rpc('place_bid', {
            p_auction_id: auction_id,
            p_bidder_id:  req.user.id,
            p_amount:     parseFloat(amount),
        });

        if (error) {
            console.error('place_bid RPC error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        // The RPC returns { success, bid_id, new_price, error_code, error_message, min_required }
        if (!result.success) {
            const statusMap = {
                auction_not_found:  404,
                auction_not_active: 400,
                auction_not_started:400,
                auction_ended:      400,
                seller_cannot_bid:  403,
                bid_too_low:        422,
                internal_error:     500,
            };
            const statusCode = statusMap[result.error_code] || 400;
            return res.status(statusCode).json({
                success: false,
                message: result.error_message,
                error_code: result.error_code,
                min_required: result.min_required,
            });
        }

        res.status(201).json({
            success: true,
            message: 'Bid placed successfully!',
            data: {
                bid_id:     result.bid_id,
                new_price:  result.new_price,
                auction_id: result.auction_id,
            },
        });
    } catch (err) {
        console.error('POST /bids crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auctions/:id/bids
// Public — paginated bid history for an auction (highest first)
// Query params: page, limit
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
    try {
        const auction_id = req.params.id;
        const { page = 1, limit = 20 } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to   = from + parseInt(limit) - 1;

        const { data, error, count } = await supabaseAdmin
            .from('bids')
            .select(`
                id,
                amount,
                is_winning,
                created_at,
                bidder:profiles!bids_bidder_id_fkey ( id, full_name, avatar_url )
            `, { count: 'exact' })
            .eq('auction_id', auction_id)
            .order('amount', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('GET /bids error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.json({
            success: true,
            data: data || [],
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((count || 0) / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GET /bids crash:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
