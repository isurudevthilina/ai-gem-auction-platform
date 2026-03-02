const { supabaseAdmin } = require('../config/supabase');

/**
 * authenticate — verifies the Bearer JWT from the Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized — missing or malformed Authorization header.',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the JWT with Supabase Auth
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized — invalid or expired token.',
            });
        }

        // Fetch the user's role from profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, role, is_verified')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized — user profile not found.',
            });
        }

        req.user = profile;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.',
        });
    }
};

/**
 * requireRole(...roles) — RBAC guard. Must be used AFTER authenticate.
 * Example: router.post('/', authenticate, requireRole('seller', 'admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Forbidden — requires role: ${roles.join(' or ')}.`,
        });
    }

    next();
};

/**
 * optionalAuth — attaches req.user if token present, otherwise continues as guest.
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name, role, is_verified')
                .eq('id', user.id)
                .single();
            if (profile) req.user = profile;
        }
    } catch (_) { /* silent */ }
    next();
};

module.exports = { authenticate, requireRole, optionalAuth };
