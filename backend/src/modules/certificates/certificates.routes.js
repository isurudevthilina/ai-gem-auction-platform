const express = require('express');
const router = express.Router();
const ctrl = require('./certificates.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const { validate, createCertificateSchema, verifyCertificateSchema, rejectCertificateSchema } = require('./certificates.validation');

// Upload URL (existing)
router.post('/upload-url', authenticate, ctrl.getUploadUrl);

// Admin — stats (BEFORE /:id)
router.get('/stats', authenticate, requireRole('admin'), ctrl.getCertStats);

// Seller — get my certificates
router.get('/mine', authenticate, requireRole('seller', 'admin'), ctrl.getSellerCertificates);

// Admin — list all with filters
router.get('/', authenticate, requireRole('admin'), ctrl.getAllCertificates);

// Seller upload (existing)
router.post('/', authenticate, requireRole('seller', 'admin'), validate(createCertificateSchema), ctrl.uploadCertificate);

// Get by gem (existing)
router.get('/gem/:gemId', authenticate, requireRole('seller', 'admin'), ctrl.getGemCertificates);

// Get a signed download URL for the certificate PDF (admin or owner)
router.get('/:id/document-url', authenticate, ctrl.getDocumentUrl);

// Get single cert (admin or owner)
router.get('/:id', authenticate, ctrl.getCertificateById);

// Verify (existing, now with validation)
router.patch('/:id/verify', authenticate, requireRole('admin'), validate(verifyCertificateSchema), ctrl.verifyCertificate);

// Reject (existing, now with validation)
router.patch('/:id/reject', authenticate, requireRole('admin'), validate(rejectCertificateSchema), ctrl.rejectCertificate);

// Delete (seller pending cert only)
router.delete('/:id', authenticate, requireRole('seller', 'admin'), ctrl.deleteCertificate);

module.exports = router;
