const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

// Now import Supabase config (which needs the env vars)
const { testConnection, ensureStorageBuckets, supabaseAdmin } = require('./src/config/supabase');
const errorHandler = require('./src/middleware/errorHandler');

// Test Supabase connection & ensure storage buckets
testConnection();
ensureStorageBuckets();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/api/v1/auth', require('./src/modules/auth/auth.routes'));
app.use('/api/users', require('./src/modules/users/users.routes'));
app.use('/api/gems', require('./src/modules/gems/gems.routes'));
app.use('/api/auctions', require('./src/modules/auctions/auctions.routes'));
app.use('/api/auctions/:id/bids', require('./src/modules/auctions/bids.routes'));
app.use('/api/bids', require('./src/modules/auctions/bids.personal.routes'));
app.use('/api/watchlist', require('./src/modules/watchlist/watchlist.routes'));
app.use('/api/reviews', require('./src/modules/reviews/reviews.routes'));
app.use('/api/certificates', require('./src/modules/certificates/certificates.routes'));
app.use('/api/transactions', require('./src/modules/transactions/transactions.routes'));
app.use('/api/admin', require('./src/modules/admin/admin.routes'));
app.use('/api/notifications', require('./src/modules/notifications/notifications.routes'));

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

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// ── Auction expiry cron — call complete_expired_auctions() every 30s ──
const AUCTION_CRON_INTERVAL = 30_000;
const runAuctionCron = async () => {
    try {
        const { data, error } = await supabaseAdmin.rpc('complete_expired_auctions');
        if (error) {
            console.error('⏱ Auction cron error:', error.message);
        } else if (data > 0) {
            console.log(`⏱ Auction cron: completed ${data} expired auction(s)`);
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

module.exports = app;
