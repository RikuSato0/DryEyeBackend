const nodemailer = require('nodemailer');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { testSmtpConnection } = require('../utils/mailer-alternative');
const { sendVerificationEmail, createTransporter } = require('../utils/mailer');

class TestController {
  async testSmtp(req, res, next) {
    try {
      // Test the main mailer first
      try {
        const transporter = createTransporter();
        await transporter.verify();
        return successResponse(res, { 
          smtpTests: [{ provider: 'Main Mailer', status: 'success' }],
          message: 'Main SMTP configuration is working'
        }, 'SMTP connection test completed', 200);
      } catch (mainError) {
        // If main mailer fails, test alternatives
        const results = await testSmtpConnection();
        return successResponse(res, { 
          smtpTests: [
            { provider: 'Main Mailer', status: 'failed', error: mainError.message },
            ...results
          ]
        }, 'SMTP connection test completed', 200);
      }
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  async testEmail(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return errorResponse(res, 'Email is required', 400);
      }

      // Generate a test OTP
      const testCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await sendVerificationEmail(email, testCode);
      return successResponse(res, { 
        message: 'Test email sent successfully',
        testCode: testCode // Only for testing - remove in production
      }, 'Test email sent', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  async testSmtpDetailed(req, res, next) {
    try {
      const results = [];
      
      // Test different SMTP configurations
      const configs = [
        { name: 'Brevo Port 587', host: process.env.SMTP_HOST, port: 587, secure: false },
        { name: 'Brevo Port 465', host: process.env.SMTP_HOST, port: 465, secure: true },
        { name: 'Brevo Port 2525', host: process.env.SMTP_HOST, port: 2525, secure: false }
      ];

      for (const config of configs) {
        try {
          const transporter = nodemailer.createTransporter({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            family: 4
          });

          await transporter.verify();
          results.push({ 
            provider: config.name, 
            status: 'success',
            host: config.host,
            port: config.port
          });
        } catch (error) {
          results.push({ 
            provider: config.name, 
            status: 'failed', 
            error: error.message,
            host: config.host,
            port: config.port
          });
        }
      }

      return successResponse(res, { smtpTests: results }, 'Detailed SMTP test completed', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  async getEnvStatus(req, res, next) {
    try {
      const envStatus = {
        SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Missing',
        SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Missing',
        SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Missing',
        SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Missing',
        SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ? 'Set' : 'Missing',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ? 'Set' : 'Missing',
        GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Missing',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      };

      return successResponse(res, { envStatus }, 'Environment status retrieved', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }
}

module.exports = new TestController();
