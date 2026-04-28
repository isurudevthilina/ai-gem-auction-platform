const repo = require('../src/modules/certificates/certificates.repository');
const { supabaseAdmin } = require('../src/config/supabase');
const { sendCertificateAuthorityEmail } = require('../src/utils/email');
const service = require('../src/modules/certificates/certificates.service');

jest.mock('../src/modules/certificates/certificates.repository', () => ({
    findById: jest.fn(),
    updateStatus: jest.fn(),
    updateAuthorityAudit: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
}));

jest.mock('../src/config/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn(),
    },
}));

jest.mock('../src/utils/email', () => ({
    sendCertificateAuthorityEmail: jest.fn(),
}));

const pendingCert = {
    id: 'cert-1',
    gem_id: 'gem-1',
    seller_id: 'seller-1',
    document_url: 'https://example.supabase.co/storage/v1/object/certificates/seller-1/cert.pdf',
    issued_by: 'GIA',
    certificate_number: 'GIA-12345',
    status: 'pending',
    gem: {
        title: 'Blue Sapphire',
        carat_weight: 2.4,
        color: 'Blue',
        clarity: 'VVS',
        origin: 'Sri Lanka',
        treatment: 'Heated',
    },
    seller: {
        full_name: 'Nimal Perera',
        email: 'seller@example.com',
        business_name: 'Perera Gems',
    },
};

const adminUser = { id: 'admin-1', role: 'admin', full_name: 'Admin User' };

const makeQuery = (result = {}) => ({
    count: result.count,
    data: result.data,
    error: result.error,
    select: jest.fn(function select() { return this; }),
    eq: jest.fn(function eq() { return this; }),
    update: jest.fn(function update() { return this; }),
    insert: jest.fn(function insert() { return this; }),
});

const setupSupabaseTables = ({ verifiedCount = 1 } = {}) => {
    const certificateCountQuery = makeQuery({ count: verifiedCount });
    const profileUpdateQuery = makeQuery();
    const notificationInsertQuery = makeQuery();

    supabaseAdmin.from.mockImplementation((table) => {
        if (table === 'certificates') return certificateCountQuery;
        if (table === 'profiles') return profileUpdateQuery;
        if (table === 'notifications') return notificationInsertQuery;
        return makeQuery();
    });

    return { certificateCountQuery, profileUpdateQuery, notificationInsertQuery };
};

describe('certificate authority email approval', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CERT_AUTHORITY_DEFAULT_EMAIL = 'authority@example.com';
        process.env.CERT_AUTHORITY_GIA_EMAIL = 'gia@example.com';
        process.env.CERT_AUTHORITY_LINK_EXPIRES_SECONDS = '604800';
    });

    afterEach(() => {
        delete process.env.CERT_AUTHORITY_DEFAULT_EMAIL;
        delete process.env.CERT_AUTHORITY_GIA_EMAIL;
        delete process.env.CERT_AUTHORITY_LINK_EXPIRES_SECONDS;
    });

    it('requires an admin user', async () => {
        await expect(
            service.sendAuthorityVerification('cert-1', { id: 'seller-1', role: 'seller' }, {})
        ).rejects.toMatchObject({ statusCode: 403, message: 'Admin access required' });
    });

    it('returns 404 when the certificate does not exist', async () => {
        repo.findById.mockResolvedValue(null);

        await expect(
            service.sendAuthorityVerification('missing-cert', adminUser, {})
        ).rejects.toMatchObject({ statusCode: 404, message: 'Certificate not found' });
    });

    it('rejects certificates that are not pending', async () => {
        repo.findById.mockResolvedValue({ ...pendingCert, status: 'verified' });

        await expect(
            service.sendAuthorityVerification('cert-1', adminUser, {})
        ).rejects.toMatchObject({ statusCode: 400, message: 'Certificate is not pending' });
    });

    it('requires a configured authority email when the request does not provide one', async () => {
        delete process.env.CERT_AUTHORITY_DEFAULT_EMAIL;
        delete process.env.CERT_AUTHORITY_GIA_EMAIL;
        repo.findById.mockResolvedValue(pendingCert);

        await expect(
            service.sendAuthorityVerification('cert-1', adminUser, {})
        ).rejects.toMatchObject({
            statusCode: 500,
            message: 'No authority email configured for this certificate issuer',
        });
    });

    it('emails the authority with a signed link and records authority approval while keeping the certificate pending', async () => {
        repo.findById.mockResolvedValue(pendingCert);
        repo.getSignedDownloadUrl.mockResolvedValue('https://signed.example.com/cert.pdf');
        sendCertificateAuthorityEmail.mockResolvedValue({ messageId: 'message-1' });
        repo.updateAuthorityAudit.mockResolvedValue({
            ...pendingCert,
            status: 'pending',
            authority_status: 'approved',
            authority_email: 'gia@example.com',
        });

        const result = await service.sendAuthorityVerification('cert-1', adminUser, {
            notes: 'Please validate this certificate for demo approval.',
        });

        expect(repo.getSignedDownloadUrl).toHaveBeenCalledWith('seller-1/cert.pdf', 604800);
        expect(sendCertificateAuthorityEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'gia@example.com',
            certificate: pendingCert,
            signedUrl: 'https://signed.example.com/cert.pdf',
            notes: 'Please validate this certificate for demo approval.',
        }));
        expect(repo.updateAuthorityAudit).toHaveBeenCalledWith('cert-1', expect.objectContaining({
            authority_email: 'gia@example.com',
            authority_message_id: 'message-1',
            authority_notes: 'Please validate this certificate for demo approval.',
            authority_status: 'approved',
            authority_sent_by: 'admin-1',
        }));
        expect(repo.updateStatus).not.toHaveBeenCalled();
        expect(supabaseAdmin.from).not.toHaveBeenCalledWith('profiles');
        expect(supabaseAdmin.from).not.toHaveBeenCalledWith('notifications');
        expect(result.data.status).toBe('pending');
        expect(result.data.authority_status).toBe('approved');
    });

    it('manual admin verification after authority approval still verifies and notifies the seller', async () => {
        setupSupabaseTables({ verifiedCount: 1 });
        repo.findById.mockResolvedValue({
            ...pendingCert,
            authority_status: 'approved',
            authority_email: 'gia@example.com',
        });
        repo.updateStatus.mockResolvedValue({
            ...pendingCert,
            status: 'verified',
            authority_status: 'approved',
            authority_email: 'gia@example.com',
        });

        const result = await service.verifyCertificate('cert-1', adminUser, 'Final admin approval.');

        expect(repo.updateStatus).toHaveBeenCalledWith('cert-1', expect.objectContaining({
            status: 'verified',
            notes: 'Final admin approval.',
            verified_by: 'admin-1',
        }));
        expect(supabaseAdmin.from).toHaveBeenCalledWith('profiles');
        expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
        expect(result.data.status).toBe('verified');
    });
});
