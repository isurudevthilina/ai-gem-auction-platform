const service = require('./certificates.service');
const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');

const getUploadUrl = catchAsync(async (req, res) => {
    const ext = req.body.ext || 'pdf';
    const result = await service.getUploadUrl(ext, req.user.id);
    res.json({ success: true, data: result.data });
});

const getSellerCertificates = catchAsync(async (req, res) => {
    const result = await service.getSellerCertificates(req.user.id);
    res.json({ success: true, data: result.data });
});

const uploadCertificate = catchAsync(async (req, res) => {
    const result = await service.uploadCertificate(req.user.id, req.validated);
    if (result.error === 'gem_not_found') return res.status(404).json({ success: false, message: 'Gem not found.' });
    if (result.error === 'forbidden')     return res.status(403).json({ success: false, message: 'You can only upload certificates for your own gems.' });
    res.status(201).json({ success: true, message: 'Certificate submitted for verification.', data: result.data });
});

const getGemCertificates = catchAsync(async (req, res) => {
    const result = await service.getGemCertificates(req.params.gemId, req.user.id);
    res.json({ success: true, data: result.data });
});

const verifyCertificate = catchAsync(async (req, res) => {
    const result = await service.verifyCertificate(req.params.id, req.user, req.validated?.notes);
    apiResponse(res, 200, result.data, 'Certificate verified.');
});

const rejectCertificate = catchAsync(async (req, res) => {
    const result = await service.rejectCertificate(req.params.id, req.user, req.validated.notes);
    apiResponse(res, 200, result.data, 'Certificate rejected.');
});

const getAllCertificates = catchAsync(async (req, res) => {
    const { status, issued_by, sort, page, limit } = req.query;
    const filters = {
        status: status || 'pending',
        issued_by: issued_by || null,
        sort: sort || 'oldest',
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 12,
    };
    const result = await service.getAllCertificates(filters);
    apiResponse(res, 200, result, 'Certificates fetched');
});

const getCertificateById = catchAsync(async (req, res) => {
    const cert = await service.getCertificateById(req.params.id, req.user.id, req.user.role);
    apiResponse(res, 200, cert, 'Certificate fetched');
});

const getCertStats = catchAsync(async (req, res) => {
    const stats = await service.getCertStats();
    apiResponse(res, 200, stats, 'Stats fetched');
});

const deleteCertificate = catchAsync(async (req, res) => {
    const result = await service.deleteCertificate(req.user.id, req.params.id);
    apiResponse(res, 200, result, 'Certificate deleted');
});

module.exports = {
    getUploadUrl,
    getSellerCertificates,
    uploadCertificate,
    getGemCertificates,
    verifyCertificate,
    rejectCertificate,
    getAllCertificates,
    getCertificateById,
    getCertStats,
    deleteCertificate,
};
