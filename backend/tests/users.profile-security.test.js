const crypto = require('crypto');

jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    auth: {
      signInWithPassword: jest.fn(),
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  },
}));

jest.mock('../src/modules/users/users.repository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
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
