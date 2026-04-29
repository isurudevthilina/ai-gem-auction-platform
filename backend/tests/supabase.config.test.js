const ORIGINAL_ENV = process.env;

const makeJwt = (payload) => {
  const encodedHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.signature`;
};

const loadConfig = (env) => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, NODE_ENV: 'test', ...env };
  jest.doMock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
      auth: { getSession: jest.fn() },
      storage: { getBucket: jest.fn(), createBucket: jest.fn() },
    })),
  }));
  return require('../src/config/supabase');
};

describe('Supabase configuration', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.dontMock('@supabase/supabase-js');
    jest.resetModules();
  });

  it('fails fast when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    expect(() => loadConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: makeJwt({ role: 'anon' }),
      SUPABASE_SERVICE_ROLE_KEY: '',
    })).toThrow('SUPABASE_SERVICE_ROLE_KEY is required');
  });

  it('rejects an anon key configured as SUPABASE_SERVICE_ROLE_KEY', () => {
    expect(() => loadConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: makeJwt({ role: 'anon' }),
      SUPABASE_SERVICE_ROLE_KEY: makeJwt({ role: 'anon' }),
    })).toThrow('SUPABASE_SERVICE_ROLE_KEY must be a service_role key');
  });

  it('accepts a service_role key for the admin client', () => {
    const config = loadConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: makeJwt({ role: 'anon' }),
      SUPABASE_SERVICE_ROLE_KEY: makeJwt({ role: 'service_role' }),
    });

    expect(config.supabaseAdmin).toBeDefined();
    expect(config.getSupabaseServiceRole()).toBe('service_role');
  });
});
