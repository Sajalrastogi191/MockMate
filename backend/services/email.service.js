const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (not your real password)
    },
});

/**
 * Send password reset email
 * @param {string} toEmail  - recipient email
 * @param {string} resetUrl - full reset link e.g. https://app.com/reset-password/<token>
 */
async function sendResetEmail(toEmail, resetUrl) {
    const mailOptions = {
        from: `"MockMate" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Reset Your MockMate Password',
        html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#030712;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
            <div style="background:rgba(255,255,255,0.15);width:56px;height:56px;border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:28px;">🤖</span>
            </div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">MockMate</h1>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">AI Mock Interview Platform</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Reset Your Password</h2>
            <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">
              We received a request to reset your MockMate password.
              Click the button below to set a new password. This link expires in <strong style="color:#a78bfa;">15 minutes</strong>.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}"
                 style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;text-decoration:none;
                        padding:14px 36px;border-radius:12px;font-weight:600;font-size:15px;
                        display:inline-block;box-shadow:0 4px 20px rgba(124,58,237,0.4);">
                Reset Password
              </a>
            </div>

            <!-- Fallback URL -->
            <p style="color:#6b7280;font-size:12px;margin:16px 0 0;word-break:break-all;">
              Or copy this link: <a href="${resetUrl}" style="color:#a78bfa;">${resetUrl}</a>
            </p>

            <!-- Warning -->
            <div style="background:#1f2937;border:1px solid #374151;border-radius:10px;padding:14px;margin-top:24px;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                ⚠️ If you didn't request this, you can safely ignore this email.
                Your password will not be changed.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:16px 32px;border-top:1px solid #1f2937;text-align:center;">
            <p style="color:#4b5563;font-size:11px;margin:0;">© ${new Date().getFullYear()} MockMate · Powered by Gemini AI</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
