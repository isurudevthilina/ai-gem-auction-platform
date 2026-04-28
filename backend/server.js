const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

// Now import Supabase config (which needs the env vars)
const { testConnection, ensureStorageBuckets } = require('./src/config/supabase');
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter, authLimiter, bidLimiter } = require('./src/middleware/rateLimiter');
const { runAuctionCompletionCron } = require('./src/modules/auctions/auctionCompletion.cron');

// Test Supabase connection & ensure storage buckets
testConnection();
ensureStorageBuckets().catch(err => console.error('❌ ensureStorageBuckets failed:', err.message));

// Check required tables exist
const checkTables = async () => {
    try {
        const { supabaseAdmin } = require('./src/config/supabase');

        const tables = [
            { name: 'password_reset_otps', purpose: 'Forgot-password OTP' },
        ];

        for (const { name, purpose } of tables) {
            const { error } = await supabaseAdmin.from(name).select('id', { count: 'exact', head: true });
            if (error && error.message.includes('does not exist')) {
                console.error(`❌ Table "${name}" does not exist. ${purpose} will fail.`);
                console.error(`   Run: create table ${name} (id uuid default gen_random_uuid() primary key, ...);`);
            } else if (error) {
                console.error(`❌ Table "${name}" check error:`, error.message);
            } else {
                console.log(`✅ ${name} table exists`);
            }
        }
        console.log('✅ Email verification uses stateless tokens (no table needed)');
    } catch (err) {
        console.error('❌ Table check failed:', err.message);
    }
};
checkTables();

// Verify SMTP configuration on startup
const verifySMTP = async () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('⚠️  SMTP not configured. Password reset emails will fail.');
        return;
    }
    try {
        const { sendMail } = require('./src/utils/email');
        const transport = require('./src/utils/email').getTransporter?.() || require('nodemailer').createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || '').replace(/\s/g, '') },
        });
        await transport.verify();
        console.log('✅ SMTP connection verified');
    } catch (err) {
        console.error('❌ SMTP connection failed:', err.message);
        if (err.message?.includes('535')) {
            console.error('   → If using Gmail, generate a NEW App Password at myaccount.google.com/apppasswords');
            console.error('   → Make sure 2-Step Verification is ON in your Google account.');
        }
    }
};
verifySMTP();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/api/v1/auth', authLimiter, require('./src/modules/auth/auth.routes'));
app.use('/api/users', require('./src/modules/users/users.routes'));
app.use('/api/gems', require('./src/modules/gems/gems.routes'));
app.use('/api/auctions', require('./src/modules/auctions/auctions.routes'));
app.use('/api/auctions/:id/bids', bidLimiter, require('./src/modules/auctions/bids.routes'));
app.use('/api/bids', require('./src/modules/auctions/bids.personal.routes'));
app.use('/api/watchlist', require('./src/modules/watchlist/watchlist.routes'));
app.use('/api/wallet', require('./src/modules/wallet/wallet.routes'));
app.use('/api/reviews', require('./src/modules/reviews/reviews.routes'));
app.use('/api/certificates', require('./src/modules/certificates/certificates.routes'));
app.use('/api/transactions', require('./src/modules/transactions/transactions.routes'));
app.use('/api/admin', require('./src/modules/admin/admin.routes'));
app.use('/api/notifications', require('./src/modules/notifications/notifications.routes'));
app.use('/api/ml', require('./src/modules/ml/ml.routes'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Gem Bidding Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

// Start server (only in non-test environments so Jest can import the app cleanly)
let server;
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;

    server = app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`📍 API URL: http://localhost:${PORT}`);
        console.log(`🌐 Client URLs: ${allowedOrigins.join(', ')}`);
    });

    // ── Auction expiry cron — call complete_expired_auctions() every 30s ──
    const AUCTION_CRON_INTERVAL = 30_000;
    const runAuctionCron = async () => {
        try {
            const result = await runAuctionCompletionCron();
            if (result.skipped) {
                return;
            }

            if (result.completed > 0 || result.repaired > 0) {
                console.log(`⏱ Auction cron: completed ${result.completed} expired auction(s), repaired ${result.repaired} winner mismatch(es)`);
            }
        } catch (err) {
            console.error('⏱ Auction cron exception:', err.message);
        }
    };
    runAuctionCron(); // run once on startup
    setInterval(runAuctionCron, AUCTION_CRON_INTERVAL);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`❌ Unhandled Rejection: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}

module.exports = app;
