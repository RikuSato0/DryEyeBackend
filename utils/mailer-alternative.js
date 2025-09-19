const nodemailer = require('nodemailer');
const logger = require('./logger');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
  NODE_ENV
} = process.env;

// Alternative SMTP configurations for better cloud compatibility
const smtpConfigs = [
  // Primary Brevo configuration
  {
    name: 'Brevo',
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  // Gmail configuration (if you want to use Gmail as backup)
  {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  // SendGrid configuration (if you want to use SendGrid as backup)
  {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  }
];

// Function to create transporter with fallback
function createTransporter() {
  for (const config of smtpConfigs) {
    try {
      // Skip if required credentials are missing
      if (config.name === 'Gmail' && !process.env.GMAIL_USER) continue;
      if (config.name === 'SendGrid' && !process.env.SENDGRID_API_KEY) continue;
      if (config.name === 'Brevo' && !SMTP_USER) continue;

      const transporter = nodemailer.createTransporter(config);
      logger.info(`Created ${config.name} transporter`);
      return { transporter, configName: config.name };
    } catch (error) {
      logger.warn(`Failed to create ${config.name} transporter:`, error.message);
      continue;
    }
  }
  
  throw new Error('No SMTP configuration available');
}

async function sendVerificationEmail(toEmail, code) {
  let lastError;
  
  for (const config of smtpConfigs) {
    try {
      // Skip if required credentials are missing
      if (config.name === 'Gmail' && !process.env.GMAIL_USER) continue;
      if (config.name === 'SendGrid' && !process.env.SENDGRID_API_KEY) continue;
      if (config.name === 'Brevo' && !SMTP_USER) continue;

      const transporter = nodemailer.createTransporter(config);
      
      const fromName = SMTP_FROM_NAME || 'EyeCare';
      const fromEmail = config.name === 'Brevo' ? (SMTP_FROM_EMAIL || SMTP_USER) : 
                       config.name === 'Gmail' ? process.env.GMAIL_USER :
                       config.name === 'SendGrid' ? process.env.SENDGRID_FROM_EMAIL : SMTP_USER;

      const subject = 'Your EyeCare verification code';
      const text = `Your verification code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">EyeCare Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>This code expires in <strong>${process.env.OTP_TTL_MINUTES || 10} minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message from EyeCare App.</p>
        </div>
      `;

      logger.info(`Attempting to send verification email via ${config.name} to: ${toEmail}`);

      // Verify connection first
      await transporter.verify();
      logger.info(`${config.name} SMTP connection verified successfully`);

      const result = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: toEmail,
        subject,
        text,
        html
      });

      logger.info(`Email sent successfully via ${config.name}: ${result.messageId}`);
      return result;
      
    } catch (error) {
      lastError = error;
      logger.warn(`Failed to send email via ${config.name}:`, error.message);
      continue;
    }
  }
  
  // If all configurations failed
  logger.error('All SMTP configurations failed. Last error:', lastError);
  throw new Error(`Email sending failed: ${lastError?.message || 'No SMTP provider available'}`);
}

// Test function to check SMTP connectivity
async function testSmtpConnection() {
  const results = [];
  
  for (const config of smtpConfigs) {
    try {
      // Skip if required credentials are missing
      if (config.name === 'Gmail' && !process.env.GMAIL_USER) {
        results.push({ provider: config.name, status: 'skipped', reason: 'Missing GMAIL_USER' });
        continue;
      }
      if (config.name === 'SendGrid' && !process.env.SENDGRID_API_KEY) {
        results.push({ provider: config.name, status: 'skipped', reason: 'Missing SENDGRID_API_KEY' });
        continue;
      }
      if (config.name === 'Brevo' && !SMTP_USER) {
        results.push({ provider: config.name, status: 'skipped', reason: 'Missing SMTP credentials' });
        continue;
      }

      const transporter = nodemailer.createTransporter(config);
      await transporter.verify();
      results.push({ provider: config.name, status: 'success' });
    } catch (error) {
      results.push({ provider: config.name, status: 'failed', error: error.message });
    }
  }
  
  return results;
}

module.exports = {
  createTransporter,
  sendVerificationEmail,
  testSmtpConnection
};
