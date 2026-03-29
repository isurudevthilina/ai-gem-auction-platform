const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');
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

const verifyCertificate = async (id, adminUser, notes) => {
    if (adminUser.role !== 'admin') throw new ApiError(403, 'Admin access required');

    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    if (cert.status !== 'pending') throw new ApiError(400, 'Certificate is not pending');

    const data = await repo.updateStatus(id, {
        status: 'verified',
        notes: notes || null,
        verified_by: adminUser.id,
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

const rejectCertificate = async (id, adminUser, notes) => {
    if (adminUser.role !== 'admin') throw new ApiError(403, 'Admin access required');

    const cert = await repo.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    if (cert.status !== 'pending') throw new ApiError(400, 'Certificate is not pending');

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

module.exports = {
    uploadCertificate,
    getSellerCertificates,
    getGemCertificates,
    rejectCertificate,
    verifyCertificate,
    getAllCertificates,
    getCertificateById,
    deleteCertificate,
    getCertStats,
    getUploadUrl,
};
