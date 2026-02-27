const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials. Please update your .env file.');
    console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
    if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
    }
}

// Create Supabase client with anon key (for client-side auth)
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: false, // Server-side doesn't need session persistence
            detectSessionInUrl: false
        }
    }
);

// Create admin client with service role key (for admin operations)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Test connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error && error.message !== 'Auth session missing!') {
            console.error('❌ Supabase Connection Error:', error.message);
        } else {
            console.log('✅ Supabase Connected Successfully');
            console.log(`📍 Project URL: ${process.env.SUPABASE_URL}`);
        }
    } catch (error) {
        console.error('❌ Supabase Connection Error:', error.message);
    }
};

module.exports = { supabase, supabaseAdmin, testConnection };
