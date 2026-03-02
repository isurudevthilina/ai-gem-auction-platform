const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use anon key to simulate real signup
const sbAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const sbAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const testEmail = 'testuser_' + Date.now() + '@gembid.dev';
    console.log('Testing signup with:', testEmail);

    // 1. Try real signUp to replicate what the browser does
    const { data, error } = await sbAnon.auth.signUp({
        email: testEmail,
        password: 'testpass123',
        options: { data: { full_name: 'Test Seller', role: 'seller' } }
    });

    if (error) {
        console.log('\nSIGNUP ERROR:', error.message, '| status:', error.status);
        console.log('Full error:', JSON.stringify(error, null, 2));
        return;
    }

    console.log('\nSIGNUP OK! User id:', data.user?.id);
    console.log('Session exists:', !!data.session);

    if (data.user) {
        await new Promise(r => setTimeout(r, 800));
        const { data: prof } = await sbAdmin.from('profiles').select('*').eq('id', data.user.id).single();
        console.log('Profile created by trigger:', prof ? JSON.stringify(prof) : 'NOT FOUND');
        // Cleanup
        await sbAdmin.auth.admin.deleteUser(data.user.id);
        console.log('Cleaned up.');
    }
}

test().catch(console.error);
