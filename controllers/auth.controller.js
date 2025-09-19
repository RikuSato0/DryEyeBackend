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
          // Add other non-sensitive user fields if needed
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
          email: user.email
        },
        token
      }, 'Login successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new AuthController();