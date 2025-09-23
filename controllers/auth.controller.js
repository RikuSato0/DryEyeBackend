const authService = require('../services/auth.service');
const {successResponse, errorResponse} = require("../utils/responseHandler");
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res, next) {
    try {
      const {email, password, userName, country, timezone, language} = req.body;
      if (!language) {
        return errorResponse(res, 'language is required', 400, 400);
      }
      console.log(email, password, userName, country, timezone,'register');
      const user = await authService.register(email, password, userName,country, timezone, language);
      return successResponse(res, {
        user: {
          id: user._id,
          email: user.email,
        },
      }, 'OTP sent to your email', 200, 201);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async resendOtp(req, res, next) {
    try {
      const {email} = req.body;
      await authService.resendOtp(email);
      return successResponse(res, {
        email: email,
      }, 'OTP resent', 200, 201);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, language } = req.body;
      if (!language) {
        return errorResponse(res, 'language is required', 400, 400);
      }
      const user = await authService.login(email, password, language);
      // Generate JWT token
      const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            // Add other claims as needed
          },
          process.env.JWT_SECRET,
          {expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
      );


      return successResponse(res, {
        user: {
          id: user._id,
          email: user.email,
          timezone: user.timezone || '',
          // Add other non-sensitive user fields if needed
          streaks: user.streaks || 0,
          avatar: user.photoUrl || null
        },
        token
      }, 'Login successful', 200, 202);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { email, code } = req.body;
      const user = await authService.verifyOtp(email, code);
      const token = jwt.sign(
          {
            userId: user._id,
            email: user.email
          },
          process.env.JWT_SECRET,
          {expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
      );
      return successResponse(res, {
        user: {
          id: user._id,
          email: user.email,
          timezone: user.timezone || '',
          streaks: user.streaks || 0,
          avatar: user.photoUrl || null
        },
        token
      }, 'Verification successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      await authService.changePassword(email, oldPassword, newPassword);
      return successResponse(res, {}, 'Password updated successfully', 200, 203);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async firebaseLogin(req, res, next) {
    try {
      const { idToken, provider, language } = req.body || {};
      if (!idToken) {
        return errorResponse(res, 'idToken is required', 400, 400);
      }
      if (!language) {
        return errorResponse(res, 'language is required', 400, 400);
      }
      const { user, token } = await authService.firebaseLogin(idToken, provider, language);
      return successResponse(res, {
        user: {
          id: user._id,
          email: user.email,
          timezone: user.timezone || ''
        },
        token
      }, 'Login successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  // Forgot password: send OTP
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 'email is required', 400, 400);
      await authService.forgotPassword(email);
      return successResponse(res, { email }, 'OTP sent to your email', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  // Verify OTP for password reset
  async verifyPasswordResetOtp(req, res, next) {
    try {
      const { email, code } = req.body;
      if (!email || !code) return errorResponse(res, 'email and code are required', 400, 400);
      await authService.verifyPasswordResetOtp(email, code);
      return successResponse(res, {}, 'Verification successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  // Reset password without old password (after OTP verified)
  async resetPassword(req, res, next) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) return errorResponse(res, 'email and newPassword are required', 400, 400);
      const user = await authService.resetPassword(email, newPassword);
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );
      return successResponse(res, {
        user: { id: user._id, email: user.email, streaks: user.streaks || 0, avatar: user.photoUrl || null },
        token
      }, 'Password reset successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  // Security & 2FA
  async securityStatus(req, res, next) {
    try {
      const data = await authService.getSecurityStatus(req.user.userId);
      return successResponse(res, data, 'Security status', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async twoFAStartEmail(req, res, next) {
    try {
      await authService.twoFAStartEmail(req.user.userId);
      return successResponse(res, {}, 'OTP sent to your email', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async twoFAStartSMS(req, res, next) {
    try {
      return errorResponse(res, 'SMS 2FA not supported', 501, 501);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async twoFAVerify(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) return errorResponse(res, 'code is required', 400, 400);
      await authService.twoFAVerify(req.user.userId, code);
      return successResponse(res, {}, 'Verification successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async twoFADisable(req, res, next) {
    try {
      await authService.twoFADisable(req.user.userId);
      return successResponse(res, {}, '2FA disabled', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async linkGoogle(req, res, next) {
    try {
      const { providerUid } = req.body;
      if (!providerUid) return errorResponse(res, 'providerUid is required', 400, 400);
      const data = await authService.linkProvider(req.user.userId, 'google', providerUid);
      return successResponse(res, data, 'Linked successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async linkApple(req, res, next) {
    try {
      const { providerUid } = req.body;
      if (!providerUid) return errorResponse(res, 'providerUid is required', 400, 400);
      const data = await authService.linkProvider(req.user.userId, 'apple', providerUid);
      return successResponse(res, data, 'Linked successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async unlinkProvider(req, res, next) {
    try {
      const { provider } = req.body;
      if (!provider) return errorResponse(res, 'provider is required', 400, 400);
      const data = await authService.unlinkProvider(req.user.userId, provider);
      return successResponse(res, data, 'Unlinked successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new AuthController();