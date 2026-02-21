const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with noreply email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (toEmail, otp, fullName) => {
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const mailOptions = {
    from: `"FleetFlow - No Reply" <${fromEmail}>`,
    to: toEmail,
    subject: '🔐 FleetFlow - Email Verification OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            🚛 FleetFlow
          </h1>
          <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">
            Fleet & Logistics Management System
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 8px;">
            Hello <strong style="color: #ffffff;">${fullName}</strong>,
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px; line-height: 1.5;">
            Use the verification code below to complete your registration. This code is valid for <strong style="color: #f59e0b;">10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #1e293b; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px;">
              Verification Code
            </p>
            <p style="color: #3b82f6; font-size: 36px; font-weight: 800; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>

          <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
            If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #0c1322; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #475569; font-size: 12px; margin: 0;">
            This is an automated message from FleetFlow. Please do not reply.
          </p>
          <p style="color: #334155; font-size: 11px; margin: 8px 0 0;">
            © ${new Date().getFullYear()} FleetFlow. All rights reserved.
          </p>
        </div>

      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail };
