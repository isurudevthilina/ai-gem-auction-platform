const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return null;
    }

    // Gmail app passwords sometimes have spaces — strip them
    const pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass,
        },
    });

    return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
    const transport = getTransporter();
    if (!transport) {
        console.warn('⚠️ SMTP not configured. Email not sent.');
        return { accepted: [], rejected: [to], message: 'SMTP not configured' };
    }

    const info = await transport.sendMail({
        from: `"GemBid LK" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
    });

    return info;
};

const sendPasswordResetOTP = async (email, otp) => {
    const subject = 'Your GemBid LK Password Reset OTP';
    const text = `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 15 minutes. If you did not request this, please ignore this email.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1a2340 0%, #2d3a5f 100%); padding: 32px 24px; text-align: center; }
            .header h1 { color: #D4AF37; margin: 0; font-size: 22px; letter-spacing: 1px; }
            .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; }
            .body { padding: 32px 24px; }
            .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .otp-box { background: #f9fafb; border: 2px dashed #D4AF37; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 32px; font-weight: 700; color: #1a2340; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .otp-label { font-size: 12px; color: #6b7280; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .footer { background: #f9fafb; padding: 20px 24px; text-align: center; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-top: 20px; }
            .warning p { color: #92400e; font-size: 13px; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GemBid LK</h1>
                <p>Secure Password Reset</p>
            </div>
            <div class="body">
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the OTP below to complete the process. This code is valid for <strong>15 minutes</strong>.</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-label">One-Time Password</div>
                </div>
                <div class="warning">
                    <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} GemBid LK. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendMail({ to: email, subject, text, html });
};

const sendVerificationOTP = async (email, otp) => {
    const subject = 'Your GemBid LK Email Verification Code';
    const text = `Welcome to GemBid LK!\n\nYour email verification code is: ${otp}\n\nEnter this code on the login page to verify your account. This code expires in 15 minutes.\n\nIf you did not create an account, you can ignore this email.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1a2340 0%, #2d3a5f 100%); padding: 32px 24px; text-align: center; }
            .header h1 { color: #D4AF37; margin: 0; font-size: 22px; letter-spacing: 1px; }
            .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; }
            .body { padding: 32px 24px; }
            .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .otp-box { background: #f9fafb; border: 2px dashed #D4AF37; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 36px; font-weight: 700; color: #1a2340; letter-spacing: 12px; font-family: 'Courier New', monospace; }
            .otp-label { font-size: 12px; color: #6b7280; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .instructions { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin-top: 20px; }
            .instructions p { color: #1e40af; font-size: 13px; margin: 0; }
            .footer { background: #f9fafb; padding: 20px 24px; text-align: center; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GemBid LK</h1>
                <p>Verify Your Email Address</p>
            </div>
            <div class="body">
                <p>Hello,</p>
                <p>Welcome to GemBid LK — Sri Lanka's premier gem auction platform. Use the verification code below to confirm your email address.</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-label">Verification Code</div>
                </div>
                <div class="instructions">
                    <p>Enter this code on the login page where it says <strong>"Enter verification code"</strong>. This code expires in <strong>15 minutes</strong>.</p>
                </div>
                <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">If you did not create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} GemBid LK. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendMail({ to: email, subject, text, html });
};

const sendProfileEmailChangeOTP = async (email, otp) => {
    const subject = 'Confirm Your New GemBid LK Email';
    const text = `Your GemBid LK email change code is: ${otp}\n\nEnter this code in your profile to confirm this email address. This code expires in 15 minutes.\n\nIf you did not request this change, ignore this message.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirm Email Change</title></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:#1a2340;padding:32px 24px;text-align:center;">
                <h1 style="color:#D4AF37;margin:0;font-size:22px;letter-spacing:1px;">GemBid LK</h1>
                <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;">Confirm Your New Email</p>
            </div>
            <div style="padding:32px 24px;">
                <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Use this code to confirm your new email address.</p>
                <div style="background:#f9fafb;border:2px dashed #D4AF37;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
                    <div style="font-size:36px;font-weight:700;color:#1a2340;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</div>
                    <div style="font-size:12px;color:#6b7280;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">Email Change Code</div>
                </div>
                <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0;">This code expires in <strong>15 minutes</strong>. If you did not request this change, ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendMail({ to: email, subject, text, html });
};

const sendProfilePasswordChangeOTP = async (email, otp) => {
    const subject = 'Confirm Your GemBid LK Password Change';
    const text = `Your GemBid LK password change code is: ${otp}\n\nEnter this code in your profile to update your password. This code expires in 15 minutes.\n\nIf you did not request this change, secure your account immediately.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirm Password Change</title></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:#1a2340;padding:32px 24px;text-align:center;">
                <h1 style="color:#D4AF37;margin:0;font-size:22px;letter-spacing:1px;">GemBid LK</h1>
                <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;">Confirm Password Change</p>
            </div>
            <div style="padding:32px 24px;">
                <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Use this code to finish changing your password.</p>
                <div style="background:#f9fafb;border:2px dashed #D4AF37;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
                    <div style="font-size:36px;font-weight:700;color:#1a2340;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</div>
                    <div style="font-size:12px;color:#6b7280;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">Password Change Code</div>
                </div>
                <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0;">This code expires in <strong>15 minutes</strong>. If you did not request this change, please review your account security.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendMail({ to: email, subject, text, html });
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatLine = (label, value) => value ? `<tr><td style="padding: 6px 0; color: #6b7280;">${label}</td><td style="padding: 6px 0; color: #111827; font-weight: 600;">${escapeHtml(value)}</td></tr>` : '';

const sendCertificateAuthorityEmail = async ({ to, certificate, signedUrl, notes }) => {
    const gem = certificate.gem || {};
    const seller = certificate.seller || {};
    const subject = `GemBid LK Certificate Verification Request - ${certificate.issued_by}${certificate.certificate_number ? ` ${certificate.certificate_number}` : ''}`;
    const text = [
        'GemBid LK certificate verification request',
        '',
        `Issuing lab: ${certificate.issued_by}`,
        `Certificate number: ${certificate.certificate_number || 'Not provided'}`,
        `Gem: ${gem.title || 'Not provided'}`,
        `Carat: ${gem.carat_weight || 'Not provided'}`,
        `Color: ${gem.color || 'Not provided'}`,
        `Clarity: ${gem.clarity || 'Not provided'}`,
        `Origin: ${gem.origin || 'Not provided'}`,
        `Treatment: ${gem.treatment || 'Not provided'}`,
        '',
        `Seller: ${seller.full_name || 'Not provided'}`,
        `Business: ${seller.business_name || 'Not provided'}`,
        `Seller email: ${seller.email || 'Not provided'}`,
        '',
        notes ? `Admin notes: ${notes}` : null,
        `Certificate PDF: ${signedUrl}`,
    ].filter(Boolean).join('\n');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Verification Request</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 620px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: #1a2340; padding: 28px 24px;">
                <h1 style="color: #D4AF37; margin: 0; font-size: 22px;">GemBid LK</h1>
                <p style="color: rgba(255,255,255,0.78); margin: 8px 0 0; font-size: 14px;">Certificate Verification Request</p>
            </div>
            <div style="padding: 28px 24px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
                    Please review the submitted certificate details and PDF for the gem listed below.
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 18px;">
                    ${formatLine('Issuing lab', certificate.issued_by)}
                    ${formatLine('Certificate number', certificate.certificate_number)}
                    ${formatLine('Gem', gem.title)}
                    ${formatLine('Carat', gem.carat_weight ? `${gem.carat_weight} ct` : null)}
                    ${formatLine('Color', gem.color)}
                    ${formatLine('Clarity', gem.clarity)}
                    ${formatLine('Origin', gem.origin)}
                    ${formatLine('Treatment', gem.treatment)}
                    ${formatLine('Seller', seller.full_name)}
                    ${formatLine('Business', seller.business_name)}
                    ${formatLine('Seller email', seller.email)}
                </table>
                ${notes ? `<div style="background: #f9fafb; border-left: 4px solid #D4AF37; padding: 12px 14px; border-radius: 6px; margin-bottom: 18px; color: #374151; font-size: 14px;"><strong>Admin notes:</strong> ${escapeHtml(notes)}</div>` : ''}
                <a href="${escapeHtml(signedUrl)}" style="display: inline-block; background: #1a2340; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                    Open Certificate PDF
                </a>
                <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 18px 0 0;">
                    This secure link is generated by GemBid LK and will expire automatically.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendMail({ to, subject, text, html });
};

module.exports = {
    sendMail,
    sendPasswordResetOTP,
    sendVerificationOTP,
    sendProfileEmailChangeOTP,
    sendProfilePasswordChangeOTP,
    sendCertificateAuthorityEmail,
    getTransporter,
};
