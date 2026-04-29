const crypto = require('crypto');

jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    auth: {
      signInWithPassword: jest.fn(),
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
      },
      getUser: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('../src/modules/users/users.repository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  updateAvatar: jest.fn(),
  hasAnyTransactions: jest.fn(),
  hasSellerGems: jest.fn(),
  hasSellerAuctions: jest.fn(),
  purgeUserAndDelete: jest.fn(),
}));

jest.mock('../src/utils/email', () => ({
  sendProfileEmailChangeOTP: jest.fn(),
  sendProfilePasswordChangeOTP: jest.fn(),
}));

const { supabaseAdmin } = require('../src/config/supabase');
const repository = require('../src/modules/users/users.repository');
const email = require('../src/utils/email');
const service = require('../src/modules/users/users.service');
const { registerSchema } = require('../src/modules/auth/auth.validation');

const hashOTP = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

describe('profile email/password OTP security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.findById.mockResolvedValue({ id: 'user-1', email: 'old@example.com' });
    repository.findByEmail.mockResolvedValue(null);
    repository.update.mockResolvedValue({ id: 'user-1', email: 'new@example.com', email_verified: true });
    supabaseAdmin.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabaseAdmin.auth.admin.getUserById.mockResolvedValue({
      data: { user: { user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({ error: null });
    email.sendProfileEmailChangeOTP.mockResolvedValue({});
    email.sendProfilePasswordChangeOTP.mockResolvedValue({});
  });

  it('requests an email change OTP only after current password and duplicate email checks pass', async () => {
    const result = await service.requestEmailChangeOTP('user-1', 'New@Example.com', 'CurrentPass1!');

    expect(supabaseAdmin.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'old@example.com',
      password: 'CurrentPass1!',
    });
    expect(repository.findByEmail).toHaveBeenCalledWith('new@example.com', 'user-1');
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      user_metadata: expect.objectContaining({
        full_name: 'Test User',
        profile_change_type: 'email',
        pending_new_email: 'new@example.com',
        profile_change_otp_hash: expect.any(String),
        profile_change_otp_expires_at: expect.any(String),
      }),
    });
    expect(email.sendProfileEmailChangeOTP).toHaveBeenCalledWith('new@example.com', expect.stringMatching(/^\d{6}$/));
    expect(result.message).toBe('Verification code sent to your new email address.');
  });

  it('rejects email change OTP request when the current password is wrong', async () => {
    supabaseAdmin.auth.signInWithPassword.mockResolvedValue({ error: { message: 'bad password' } });

    await expect(
      service.requestEmailChangeOTP('user-1', 'new@example.com', 'wrong')
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Current password is incorrect',
    });

    expect(email.sendProfileEmailChangeOTP).not.toHaveBeenCalled();
  });

  it('requests a password change OTP to the current account email', async () => {
    const result = await service.requestPasswordChangeOTP('user-1', 'CurrentPass1!');

    expect(supabaseAdmin.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'old@example.com',
      password: 'CurrentPass1!',
    });
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      user_metadata: expect.objectContaining({
        full_name: 'Test User',
        profile_change_type: 'password',
        pending_new_email: null,
        profile_change_otp_hash: expect.any(String),
        profile_change_otp_expires_at: expect.any(String),
      }),
    });
    expect(email.sendProfilePasswordChangeOTP).toHaveBeenCalledWith('old@example.com', expect.stringMatching(/^\d{6}$/));
    expect(result.message).toBe('Verification code sent to your current email address.');
  });

  it('confirms email change with a valid OTP and clears profile change metadata', async () => {
    supabaseAdmin.auth.admin.getUserById
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'email',
              pending_new_email: 'new@example.com',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() + 60000).toISOString(),
            },
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'email',
              pending_new_email: 'new@example.com',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() + 60000).toISOString(),
              full_name: 'Test User',
            },
          },
        },
        error: null,
      });

    const result = await service.changeEmail('user-1', 'new@example.com', '123456');

    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      email: 'new@example.com',
      email_confirm: true,
    });
    expect(repository.update).toHaveBeenCalledWith('user-1', {
      email: 'new@example.com',
      email_verified: true,
    });
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenLastCalledWith('user-1', {
      user_metadata: { full_name: 'Test User' },
    });
    expect(result.message).toBe('Email updated successfully.');
  });

  it('rejects expired password change OTP and does not update the password', async () => {
    supabaseAdmin.auth.admin.getUserById
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'password',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() - 60000).toISOString(),
            },
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'password',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() - 60000).toISOString(),
              full_name: 'Test User',
            },
          },
        },
        error: null,
      });

    await expect(
      service.changePassword('user-1', '123456', 'NewPass1!')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid or expired OTP.',
    });

    expect(supabaseAdmin.auth.admin.updateUserById).not.toHaveBeenCalledWith('user-1', {
      password: 'NewPass1!',
    });
  });

  it('confirms password change with a valid OTP and clears profile change metadata', async () => {
    supabaseAdmin.auth.admin.getUserById
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'password',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() + 60000).toISOString(),
            },
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            user_metadata: {
              profile_change_type: 'password',
              profile_change_otp_hash: hashOTP('123456'),
              profile_change_otp_expires_at: new Date(Date.now() + 60000).toISOString(),
              full_name: 'Test User',
            },
          },
        },
        error: null,
      });

    const result = await service.changePassword('user-1', '123456', 'NewPass1!');

    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'NewPass1!',
    });
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenLastCalledWith('user-1', {
      user_metadata: { full_name: 'Test User' },
    });
    expect(result.message).toBe('Password updated successfully.');
  });
});

describe('signup validation', () => {
  it('accepts buyer personal address fields without requiring seller fields', () => {
    const parsed = registerSchema.parse({
      role: 'buyer',
      full_name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'StrongPass1!',
      phone_number: '0712345678',
      province: 'Sabaragamuwa Province',
      district: 'Ratnapura',
      city: 'Ratnapura',
      address_line1: 'No. 12 Gem Street',
      address_line2: 'Near Clock Tower',
      postal_code: '70000',
    });

    expect(parsed.city).toBe('Ratnapura');
    expect(parsed.address_line1).toBe('No. 12 Gem Street');
    expect(parsed.postal_code).toBe('70000');
  });
});

describe('profile self deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.findById.mockResolvedValue({
      id: 'seller-1',
      email: 'seller@example.com',
      role: 'seller',
    });
    repository.hasAnyTransactions.mockResolvedValue(false);
    repository.hasSellerGems.mockResolvedValue(false);
    repository.hasSellerAuctions.mockResolvedValue(false);
    repository.purgeUserAndDelete.mockResolvedValue(undefined);
    supabaseAdmin.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({ error: null });
  });

  it('allows a seller without gem posts or auctions to delete their own account', async () => {
    const result = await service.deleteAccount('seller-1', 'CurrentPass1!');

    expect(supabaseAdmin.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'seller@example.com',
      password: 'CurrentPass1!',
    });
    expect(repository.hasSellerGems).toHaveBeenCalledWith('seller-1');
    expect(repository.hasSellerAuctions).toHaveBeenCalledWith('seller-1');
    expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('seller-1');
    expect(result.message).toBe('Account deleted successfully.');
  });

  it('blocks seller self deletion when the seller has any gem posts', async () => {
    repository.hasSellerGems.mockResolvedValue(true);

    await expect(
      service.deleteAccount('seller-1', 'CurrentPass1!')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Cannot delete seller account while gem posts exist. Remove your gem posts first.',
    });

    expect(supabaseAdmin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('blocks seller self deletion when the seller has any auctions', async () => {
    repository.hasSellerAuctions.mockResolvedValue(true);

    await expect(
      service.deleteAccount('seller-1', 'CurrentPass1!')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Cannot delete seller account while auctions exist. Remove your auctions first.',
    });

    expect(supabaseAdmin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
});

describe('profile update error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a clear error when the profile row cannot be updated', async () => {
    repository.update.mockRejectedValue({
      code: 'PGRST116',
      message: 'Cannot coerce the result to a single JSON object',
    });

    await expect(
      service.updateProfile('missing-user', { full_name: 'Updated User' })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Profile could not be updated because no matching profile row was found.',
    });
  });

  it('returns a clear error when avatar storage upload is blocked by RLS', async () => {
    supabaseAdmin.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        error: {
          statusCode: '403',
          message: 'new row violates row-level security policy',
        },
      }),
    });

    await expect(
      service.uploadAvatar('user-1', {
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from('avatar'),
      })
    ).rejects.toMatchObject({
      statusCode: 500,
      message: 'Avatar upload is blocked by Supabase Storage RLS. Check that the backend is using SUPABASE_SERVICE_ROLE_KEY and restart the server.',
    });

    expect(repository.updateAvatar).not.toHaveBeenCalled();
  });
});
