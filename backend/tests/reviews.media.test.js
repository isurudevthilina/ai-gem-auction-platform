jest.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    storage: {
      createBucket: jest.fn(),
    },
  },
}));

jest.mock('../src/modules/reviews/reviews.repository', () => ({
  createSignedUploadUrl: jest.fn(),
}));

const repository = require('../src/modules/reviews/reviews.repository');
const { supabaseAdmin } = require('../src/config/supabase');
const service = require('../src/modules/reviews/reviews.service');

describe('review media upload URLs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns signed upload data for supported image extensions', async () => {
    repository.createSignedUploadUrl.mockResolvedValue({
      path: 'buyer-1/image.png',
      token: 'signed-token',
    });

    const result = await service.getReviewMediaUploadUrl('buyer-1', 'png', 'image');

    expect(repository.createSignedUploadUrl).toHaveBeenCalledWith(
      'review-media',
      expect.stringMatching(/^buyer-1\/.+\.png$/)
    );
    expect(result).toEqual({ path: 'buyer-1/image.png', token: 'signed-token' });
  });

  it('returns signed upload data for supported video extensions', async () => {
    repository.createSignedUploadUrl.mockResolvedValue({
      path: 'buyer-1/video.mov',
      token: 'signed-token',
    });

    const result = await service.getReviewMediaUploadUrl('buyer-1', 'mov', 'video');

    expect(repository.createSignedUploadUrl).toHaveBeenCalledWith(
      'review-media',
      expect.stringMatching(/^buyer-1\/.+\.mov$/)
    );
    expect(result).toEqual({ path: 'buyer-1/video.mov', token: 'signed-token' });
  });

  it('rejects unsupported media extensions before creating a signed upload URL', async () => {
    await expect(
      service.getReviewMediaUploadUrl('buyer-1', 'exe', 'image')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Unsupported media extension',
    });

    expect(repository.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it('creates the review-media bucket if signed URL generation reports a missing bucket', async () => {
    repository.createSignedUploadUrl
      .mockRejectedValueOnce({ message: 'Bucket not found' })
      .mockResolvedValueOnce({ path: 'buyer-1/video.mp4', token: 'signed-token' });
    supabaseAdmin.storage.createBucket.mockResolvedValue({ error: null });

    const result = await service.getReviewMediaUploadUrl('buyer-1', 'mp4', 'video');

    expect(supabaseAdmin.storage.createBucket).toHaveBeenCalledWith('review-media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
      ],
      fileSizeLimit: 52428800,
    });
    expect(result).toEqual({ path: 'buyer-1/video.mp4', token: 'signed-token' });
  });
});

describe('storage bucket bootstrap', () => {
  it('includes the public review-media bucket in required storage buckets', async () => {
    jest.resetModules();
    jest.unmock('../src/config/supabase');
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

    const getBucket = jest.fn()
      .mockResolvedValueOnce({ data: { name: 'gem-images' }, error: null })
      .mockResolvedValueOnce({ data: { name: 'gem-models' }, error: null })
      .mockResolvedValueOnce({ data: { name: 'certificates' }, error: null })
      .mockResolvedValueOnce({ data: { name: 'avatars' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
    const createBucket = jest.fn().mockResolvedValue({ error: null });

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => ({
        auth: { getSession: jest.fn() },
        storage: { getBucket, createBucket },
      })),
    }));

    const { ensureStorageBuckets } = require('../src/config/supabase');
    await ensureStorageBuckets();

    expect(getBucket).toHaveBeenCalledWith('review-media');
    expect(createBucket).toHaveBeenCalledWith('review-media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
      ],
      fileSizeLimit: 52428800,
    });
  });
});
