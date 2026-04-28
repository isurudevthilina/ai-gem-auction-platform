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

// Ensure required storage buckets exist
const ensureStorageBuckets = async () => {
    const requiredBuckets = [
        { name: 'gem-images', public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'], fileSizeLimit: 10485760 },
        { name: 'gem-models', public: true, allowedMimeTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'], fileSizeLimit: 52428800 },
        { name: 'certificates', public: false, allowedMimeTypes: ['application/pdf'], fileSizeLimit: 10485760 },
        { name: 'avatars', public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fileSizeLimit: 2097152 },
        { name: 'review-media', public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'], fileSizeLimit: 52428800 },
    ];

    for (const bucket of requiredBuckets) {
        const { data, error } = await supabaseAdmin.storage.getBucket(bucket.name);
        if (error && error.message?.includes('not found')) {
            const { error: createErr } = await supabaseAdmin.storage.createBucket(bucket.name, {
                public: bucket.public,
                allowedMimeTypes: bucket.allowedMimeTypes,
                fileSizeLimit: bucket.fileSizeLimit,
            });
            if (createErr) {
                console.error(`❌ Failed to create bucket '${bucket.name}':`, createErr.message);
            } else {
                console.log(`✅ Storage bucket '${bucket.name}' created`);
            }
        } else if (data) {
            console.log(`✅ Storage bucket '${bucket.name}' exists`);
        }
    }
};

module.exports = { supabase, supabaseAdmin, testConnection, ensureStorageBuckets };
