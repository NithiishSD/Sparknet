import nodemailer from 'nodemailer';

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email. Expires in 24 hours.</p>
      <a href="${url}" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a>
      <p>If you didn't register, ignore this email.</p>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password. Expires in 60 minutes.</p>
      <a href="${url}" style="background:#EF4444;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a>
    `,
  });
};

// Renamed: guardianInvite replaces parentInvite
const sendGuardianInviteEmail = async (guardianEmail, childUsername, token) => {
  const url = `${process.env.CLIENT_URL}/guardian-approve?token=${token}`;
  await sendEmail({
    to: guardianEmail,
    subject: `Action Required: Approve ${childUsername}'s account`,
    html: `
      <h2>Guardian Approval Required</h2>
      <p>A child account for <strong>${childUsername}</strong> has listed you as their guardian. Approve to activate their account.</p>
      <a href="${url}" style="background:#10B981;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Approve Account</a>
      <p>This link expires in 48 hours. If you don't know this child, ignore this email.</p>
    `,
  });
};

const sendAccountStatusEmail = async (email, username, status, reason = '') => {
  const messages = {
    suspended: 'Your account has been temporarily suspended.',
    banned: 'Your account has been permanently banned.',
    active: 'Your account has been reactivated.',
  };
  await sendEmail({
    to: email,
    subject: 'Account Status Update',
    html: `
      <h2>Account Update for ${username}</h2>
      <p>${messages[status] || 'Your account status has changed.'}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    `,
  });
};

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendGuardianInviteEmail,
  sendAccountStatusEmail,
};
