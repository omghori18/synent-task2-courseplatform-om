const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('✅ Email service ready'))
  .catch((err) => console.error('❌ Email config error:', err.message));

/**
 * Send verification email
 */
const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #eaedf0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; color: #1D2B4F; margin: 0;">LearnSphere</h1>
      </div>
      <h2 style="font-size: 20px; color: #0A0A0A; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #737880; font-size: 15px; line-height: 1.6;">
        Hi ${name},<br/><br/>
        Thanks for signing up for LearnSphere! Please click the button below to verify your email address.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 32px; background: #1D2B4F; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #737880; font-size: 13px; line-height: 1.6;">
        Or copy and paste this link in your browser:<br/>
        <a href="${verifyUrl}" style="color: #1D2B4F; word-break: break-all;">${verifyUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eaedf0; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LearnSphere" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Verify your email — LearnSphere',
    html,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #eaedf0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; color: #1D2B4F; margin: 0;">LearnSphere</h1>
      </div>
      <h2 style="font-size: 20px; color: #0A0A0A; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #737880; font-size: 15px; line-height: 1.6;">
        Hi ${name},<br/><br/>
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #1D2B4F; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Reset Password
        </a>
      </div>
      <p style="color: #737880; font-size: 13px; line-height: 1.6;">
        Or copy and paste this link in your browser:<br/>
        <a href="${resetUrl}" style="color: #1D2B4F; word-break: break-all;">${resetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eaedf0; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LearnSphere" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Reset your password — LearnSphere',
    html,
  });
};

/**
 * Send enrollment confirmation email
 */
const sendEnrollmentEmail = async (to, name, courseName) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #eaedf0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; color: #1D2B4F; margin: 0;">LearnSphere</h1>
      </div>
      <h2 style="font-size: 20px; color: #0A0A0A; margin-bottom: 8px;">Enrollment confirmed!</h2>
      <p style="color: #737880; font-size: 15px; line-height: 1.6;">
        Hi ${name},<br/><br/>
        You have been successfully enrolled in <strong style="color: #0A0A0A;">${courseName}</strong>. You can start learning right away!
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 32px; background: #16A34A; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Start Learning →
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eaedf0; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        Happy learning! — The LearnSphere Team
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LearnSphere" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Enrolled: ${courseName} — LearnSphere`,
    html,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendEnrollmentEmail };
