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

// Validate required environment variables
function validateSmtpConfig() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error('Missing required SMTP environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  logger.info('SMTP environment variables validated successfully');
  return true;
}

// Function to create transporter dynamically
function createTransporter() {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Additional options for better connectivity
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
      ciphers: 'SSLv3'
    },
    connectionTimeout: 30000, // 30 seconds (reduced from 60)
    greetingTimeout: 15000,   // 15 seconds (reduced from 30)
    socketTimeout: 30000,     // 30 seconds (reduced from 60)
    // Retry configuration
    pool: false, // Disable pooling for better reliability
    maxConnections: 1,
    maxMessages: 1,
    rateDelta: 10000, // 10 seconds
    rateLimit: 1, // 1 message per 10 seconds
    // Additional timeout settings
    dnsTimeout: 10000, // 10 seconds for DNS lookup
    // Force IPv4 to avoid IPv6 issues
    family: 4
  };

  logger.info('Creating SMTP transporter with config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user ? 'Set' : 'Missing',
    family: config.family
  });

  return nodemailer.createTransport(config);
}

async function sendVerificationEmail(toEmail, code) {
  const fromName = process.env.SMTP_FROM_NAME || 'EyeCare';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const subject = 'Your EyeCare verification code';
  const text = `Your verification code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`;
  const html = `<p>Your verification code is <b>${code}</b>.</p><p>It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>`;

  logger.info(`Attempting to send verification email to: ${toEmail}`);

  // Try multiple SMTP configurations
  const smtpConfigs = [
    // Primary Brevo configuration
    {
      name: 'Brevo (Port 587)',
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: { rejectUnauthorized: false, ciphers: 'SSLv3' },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      dnsTimeout: 10000,
      family: 4
    },
    // Alternative Brevo configuration with port 465
    {
      name: 'Brevo (Port 465)',
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      dnsTimeout: 10000,
      family: 4
    },
    // Alternative Brevo configuration with port 2525
    {
      name: 'Brevo (Port 2525)',
      host: process.env.SMTP_HOST,
      port: 2525,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      dnsTimeout: 10000,
      family: 4
    }
  ];

  let lastError;

  for (const config of smtpConfigs) {
    try {
      logger.info(`Trying ${config.name} - Host: ${config.host}, Port: ${config.port}`);
      
      const transporter = nodemailer.createTransport(config);
      
      // Verify connection first
      await transporter.verify();
      logger.info(`${config.name} connection verified successfully`);

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

module.exports = {
  createTransporter,
  sendVerificationEmail
};


