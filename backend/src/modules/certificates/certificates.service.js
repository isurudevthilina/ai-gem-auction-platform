const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');
const { sendCertificateAuthorityEmail } = require('../../utils/email');
const repo = require('./certificates.repository');

const uploadCertificate = async (sellerId, validated) => {
    // Verify gem exists and belongs to seller
    const { data: gem, error: gemErr } = await supabaseAdmin
        .from('gems')
        .select('id, seller_id')
        .eq('id', validated.gem_id)
        .single();

    if (gemErr || !gem) return { error: 'gem_not_found' };
    if (gem.seller_id !== sellerId) return { error: 'forbidden' };

    // Create certificate record
    const cert = await repo.create({
        gem_id: validated.gem_id,
        seller_id: sellerId,
        document_url: validated.document_url,
        issued_by: validated.issued_by,
        certificate_number: validated.certificate_number || null,
        status: 'pending',
    });

    // Update the gem's certification fields
    await supabaseAdmin
        .from('gems')
        .update({
            certification_body: validated.issued_by,
            certification: validated.certificate_number || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', validated.gem_id);

    return { data: cert };
};

const getSellerCertificates = async (sellerId) => {
    const data = await repo.findBySeller(sellerId);
    return { data };
};

const getGemCertificates = async (gemId, sellerId) => {
    const certificates = await repo.findByGem(gemId);
    const filtered = certificates.filter(c => c.seller_id === sellerId);
    return { data: filtered };
};

const assertAdmin = (adminUser) => {
    if (adminUser.role !== 'admin') throw new ApiError(403, 'Admin access required');
};

const assertPendingCertificate = (cert) => {
    if (cert.status !== 'pending') throw new ApiError(400, 'Certificate is not pending');
};

const extractCertificateStoragePath = (documentUrl) => {
    const marker = '/storage/v1/object/certificates/';
    const idx = (documentUrl || '').indexOf(marker);
    if (idx === -1) throw new ApiError(400, 'Invalid document URL');
    return documentUrl.slice(idx + marker.length);
};

const getAuthorityEnvKey = (issuedBy) => {
    const normalized = String(issuedBy || 'Other')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase();
    return `CERT_AUTHORITY_${normalized || 'OTHER'}_EMAIL`;
};

const resolveAuthorityEmail = (cert, overrideEmail) => {
    if (overrideEmail) return overrideEmail;

    const labEmail = process.env[getAuthorityEnvKey(cert.issued_by)];
    if (labEmail) return labEmail.trim().toLowerCase();

    const defaultEmail = process.env.CERT_AUTHORITY_DEFAULT_EMAIL;
    if (defaultEmail) return defaultEmail.trim().toLowerCase();

    throw new ApiError(500, 'No authority email configured for this certificate issuer');
};

const getAuthorityLinkExpiry = () => {
    const parsed = parseInt(process.env.CERT_AUTHORITY_LINK_EXPIRES_SECONDS || '604800', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 604800;
};

const completeCertificateVerification = async (id, cert, adminUser, notes, extraFields = {}) => {
    const data = await repo.updateStatus(id, {
        status: 'verified',
        notes: notes || null,
        verified_by: adminUser.id,
        ...extraFields,
    });

    // Check if first verified cert for this seller → mark seller verified
    const { count } = await supabaseAdmin
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', cert.seller_id)
        .eq('status', 'verified');

    if (count === 1) {
        await supabaseAdmin
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', cert.seller_id);
    }

    // Notify seller
    await supabaseAdmin.from('notifications').insert({
        user_id: cert.seller_id,
        type: 'certificate_verified',
        title: 'Certificate Verified',
        message: `Your ${cert.issued_by} certificate has been verified.`,
        data: { cert_id: id, gem_id: cert.gem_id },
    });

    return { data };
};

const verifyCertificate = async (id, adminUser, notes) => {
    assertAdmin(adminUser);

    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    assertPendingCertificate(cert);

    return completeCertificateVerification(id, cert, adminUser, notes);
};

const sendAuthorityVerification = async (id, adminUser, payload = {}) => {
    assertAdmin(adminUser);

    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    assertPendingCertificate(cert);

    const authorityEmail = resolveAuthorityEmail(cert, payload.authority_email);
    const storagePath = extractCertificateStoragePath(cert.document_url);
    const signedUrl = await repo.getSignedDownloadUrl(storagePath, getAuthorityLinkExpiry());
    const mailInfo = await sendCertificateAuthorityEmail({
        to: authorityEmail,
        certificate: cert,
        signedUrl,
        notes: payload.notes,
    });

    const now = new Date().toISOString();
    const data = await repo.updateAuthorityAudit(id, {
        authority_email: authorityEmail,
        authority_sent_at: now,
        authority_sent_by: adminUser.id,
        authority_message_id: mailInfo?.messageId || null,
        authority_notes: payload.notes || null,
        authority_status: 'approved',
        authority_approved_at: now,
    });

    return { data };
};

const rejectCertificate = async (id, adminUser, notes) => {
    assertAdmin(adminUser);

    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    assertPendingCertificate(cert);

    const data = await repo.updateStatus(id, {
        status: 'rejected',
        notes,
        verified_by: adminUser.id,
    });

    // Notify seller
    await supabaseAdmin.from('notifications').insert({
        user_id: cert.seller_id,
        type: 'certificate_rejected',
        title: 'Certificate Rejected',
        message: `Your ${cert.issued_by} certificate requires attention.`,
        data: { cert_id: id, gem_id: cert.gem_id, reason: notes },
    });

    return { data };
};

const getAllCertificates = async (filters) => {
    return repo.findAll(filters);
};

const getCertificateById = async (id, userId, role) => {
    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    if (role !== 'admin' && cert.seller_id !== userId) {
        throw new ApiError(403, 'Access denied');
    }
    return cert;
};

const deleteCertificate = async (sellerId, certId) => {
    return repo.delete(certId, sellerId);
};

const getCertStats = async () => {
    return repo.getCertStats();
};

const getUploadUrl = async (ext, sellerId) => {
    const result = await repo.getUploadUrl(ext, sellerId);
    return { data: result };
};

const getDocumentUrl = async (certId, userId, role) => {
    const cert = await repo.findById(certId);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    if (role !== 'admin' && cert.seller_id !== userId) {
        throw new ApiError(403, 'Access denied');
    }

    const storagePath = extractCertificateStoragePath(cert.document_url);

    const signedUrl = await repo.getSignedDownloadUrl(storagePath);
    return { data: { url: signedUrl } };
};

module.exports = {
    uploadCertificate,
    getSellerCertificates,
    getGemCertificates,
    rejectCertificate,
    verifyCertificate,
    sendAuthorityVerification,
    getAllCertificates,
    getCertificateById,
    deleteCertificate,
    getCertStats,
    getUploadUrl,
    getDocumentUrl,
};
