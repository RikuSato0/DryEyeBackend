const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME
} = process.env;

// Create a reusable transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

async function sendVerificationEmail(toEmail, code) {
  const fromName = SMTP_FROM_NAME || 'EyeCare';
  const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;

  const subject = 'Your EyeCare verification code';
  const text = `Your verification code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`;
  const html = `<p>Your verification code is <b>${code}</b>.</p><p>It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>`;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html
  });
}

module.exports = {
  transporter,
  sendVerificationEmail
};


