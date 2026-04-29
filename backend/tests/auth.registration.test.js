jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  },
}));

jest.mock('../src/utils/email', () => ({
  sendPasswordResetOTP: jest.fn(),
  sendVerificationOTP: jest.fn(),
}));

const { supabaseAdmin } = require('../src/config/supabase');
const email = require('../src/utils/email');
const service = require('../src/modules/auth/auth.service');

const makeProfileLookup = (result) => {
  const query = {};
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.maybeSingle = jest.fn(() => Promise.resolve(result));
  return query;
};

const makeProfileUpsert = (result) => ({
  upsert: jest.fn(() => Promise.resolve(result)),
});

describe('auth registration profile persistence', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    supabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'buyer@example.com' } },
      error: null,
    });
    supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({ error: null });
    email.sendVerificationOTP.mockResolvedValue({});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('stops registration when buyer personal information cannot be saved to profiles', async () => {
    const profileUpsert = makeProfileUpsert({ error: { message: 'profiles write failed' } });
    supabaseAdmin.from
      .mockReturnValueOnce(makeProfileLookup({ data: null, error: null }))
      .mockReturnValueOnce(profileUpsert);

    await expect(service.registerUser({
      role: 'buyer',
      full_name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'StrongPass1!',
      phone_number: '0712345678',
      province: 'Sabaragamuwa Province',
      district: 'Ratnapura',
      city: 'Ratnapura',
      address_line1: 'No. 12 Gem Street',
      postal_code: '70000',
    })).rejects.toMatchObject({
      statusCode: 500,
      message: 'Failed to save profile information. Please try again.',
    });

    expect(email.sendVerificationOTP).not.toHaveBeenCalled();
  });

  it('saves buyer personal information before sending verification', async () => {
    const profileUpsert = makeProfileUpsert({ error: null });
    supabaseAdmin.from
      .mockReturnValueOnce(makeProfileLookup({ data: null, error: null }))
      .mockReturnValueOnce(profileUpsert)
      .mockReturnValueOnce(makeProfileLookup({ data: { id: 'user-1' }, error: null }));

    await service.registerUser({
      role: 'buyer',
      full_name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'StrongPass1!',
      phone_number: '0712345678',
    });

    expect(profileUpsert.upsert).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'buyer@example.com',
      full_name: 'Buyer User',
      role: 'buyer',
      phone_number: '0712345678',
      district: null,
      province: null,
      city: null,
      address_line1: null,
      address_line2: null,
      postal_code: null,
      email_verified: false,
    }, { onConflict: 'id' });
    expect(email.sendVerificationOTP).toHaveBeenCalledWith('buyer@example.com', expect.stringMatching(/^\d{6}$/));
  });
});
