const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateOtp, hashOtp, compareOtp, getExpiryDate, isExpired, isCooldownOver } = require('../utils/otp');
const { sendVerificationEmail } = require('../utils/mailer');
const { sendVerificationEmail: sendVerificationEmailAlt } = require('../utils/mailer-alternative');
const logger = require('../utils/logger');
const { initFirebaseAdmin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_DAILY_RESEND_LIMIT = Number(process.env.OTP_DAILY_RESEND_LIMIT || 5);

class AuthService {
  async register(email, password, userName, country, timezone, language) {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new ApiError(400, 'The email address is already registered', 408);
    }
    const defaultAvatar = process.env.DEFAULT_AVATAR_URL || '/uploads/default.png';
    const user = await userRepository.create({ email, password, userName, country, timezone, language, isVerified: false, photoUrl: defaultAvatar });

    const otp = generateOtp();
    user.otpCodeHash = await hashOtp(otp);
    user.otpExpiresAt = getExpiryDate();
    user.otpAttemptCount = 0;
    user.otpResendCount = 0;
    user.otpLastSentAt = new Date();
    await user.save();

    try {
      await sendVerificationEmail(user.email, otp);
    } catch (error) {
      logger.warn('Primary mailer failed, trying alternative:', error.message);
      await sendVerificationEmailAlt(user.email, otp);
    }
    return user;
  }

  async login(email, password, language) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Incorrect email or password', 406);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect email or password', 407);
    }

    if (!user.isVerified) {
      throw new ApiError(403, 'Please verify your email', 409);
    }
    // Auto-downgrade if subscription expired
    if (user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
      user.subscription = { plan: 'free', startedAt: user.subscription.startedAt, expiresAt: null };
    }
    // Update streaks based on lastLoginAt
    const now = new Date();
    const last = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
    if (last) {
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((today - lastDay) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        user.streaks = (user.streaks || 0) + 1;
      } else if (diffDays > 1) {
        user.streaks = 0;
      }
    } else {
      user.streaks = 0;
    }
    user.lastLoginAt = now;
    if (language && user.language !== language) {
      user.language = language;
    }
    await user.save();
    return user;
  }

  async changePassword(email, oldPassword, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found', 404);
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect old password', 405);
    }
    user.password = newPassword;
    await user.save();
    return user;
  }

  async verifyOtp(email, code) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired code', 410);
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      throw new ApiError(400, 'Invalid or expired code', 411);
    }

    if (isExpired(user.otpExpiresAt)) {
      throw new ApiError(400, 'Invalid or expired code', 412);
    }

    if (user.otpAttemptCount >= OTP_MAX_ATTEMPTS) {
      throw new ApiError(429, 'Too many attempts. Please request a new code', 413);
    }

    const ok = await compareOtp(code, user.otpCodeHash);
    if (!ok) {
      user.otpAttemptCount += 1;
      await user.save();
      throw new ApiError(400, 'Invalid or expired code', 414);
    }

    user.isVerified = true;
    // initialize streaks and last login at verification time
    user.streaks = 0;
    user.lastLoginAt = new Date();
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttemptCount = 0;
    user.otpResendCount = 0;
    user.otpLastSentAt = null;
    await user.save();
    return user;
  }

  async resendOtp(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(200, 'If an account exists, a new code has been sent', 200);
    }

    if (user.isVerified) {
      throw new ApiError(400, 'Account already verified', 415);
    }

    const now = new Date();
    if (!isCooldownOver(user.otpLastSentAt, now)) {
      throw new ApiError(429, 'Please wait before requesting a new code', 416);
    }

    if (user.otpLastSentAt && now.getTime() - new Date(user.otpLastSentAt).getTime() > 24 * 60 * 60 * 1000) {
      user.otpResendCount = 0;
    }
    if (user.otpResendCount >= OTP_DAILY_RESEND_LIMIT) {
      throw new ApiError(429, 'Daily resend limit reached', 417);
    }

    const otp = generateOtp();
    user.otpCodeHash = await hashOtp(otp);
    user.otpExpiresAt = getExpiryDate(now);
    user.otpAttemptCount = 0;
    user.otpResendCount += 1;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await sendVerificationEmail(user.email, otp);
    } catch (error) {
      logger.warn('Primary mailer failed, trying alternative:', error.message);
      await sendVerificationEmailAlt(user.email, otp);
    }
    return { email: user.email };
  }

  async firebaseLogin(idToken, provider, language) {
    const admin = initFirebaseAdmin();
    if (!admin) {
      throw new ApiError(500, 'Social login is not configured on server', 501);
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken, { checkRevoked: false });
    } catch (e) {
      throw new ApiError(401, 'Invalid Firebase ID token', 502);
    }

    const firebaseUid = decoded.uid;
    const email = decoded.email || '';
    const name = decoded.name || decoded.displayName || '';
    const picture = decoded.picture || '';
    const providerIdRaw = (decoded.firebase && decoded.firebase.sign_in_provider) || provider || 'unknown';

    // Normalize provider to schema enum values
    const providerMap = {
      'google.com': 'google',
      'apple.com': 'apple',
      'facebook.com': 'facebook',
      google: 'google',
      apple: 'apple',
      facebook: 'facebook'
    };
    const providerId = providerMap[providerIdRaw] || null;

    if (!providerId) {
      throw new ApiError(400, `Unsupported provider: ${providerIdRaw}`, 504);
    }

    if (!email) {
      throw new ApiError(400, 'Email is required from provider', 503);
    }

    let user = await userRepository.findByEmail(email);
    if (!user) {
      // Create user with a placeholder password (will be hashed by pre-save)
      const randomPassword = Math.random().toString(36).slice(-12) + '!A9';
      const defaultAvatar = process.env.DEFAULT_AVATAR_URL || '/uploads/default.png';
      user = await userRepository.create({
        email,
        password: randomPassword,
        userName: name,
        isVerified: true,
        firebaseUid,
        authProvider: providerId,
        photoUrl: picture || defaultAvatar,
        lastLoginAt: new Date(),
        streaks: 0,
        language
      });
    } else {
      user.isVerified = true;
      user.firebaseUid = firebaseUid;
      user.authProvider = providerId;
      user.photoUrl = picture || user.photoUrl;
      // Streaks update on social login
      const now = new Date();
      const last = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
      if (last) {
        const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.round((today - lastDay) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) {
          user.streaks = (user.streaks || 0) + 1;
        } else if (diffDays > 1) {
          user.streaks = 0;
        }
      } else {
        user.streaks = 0;
      }
      user.lastLoginAt = now;
      if (user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
        user.subscription = { plan: 'free', startedAt: user.subscription.startedAt, expiresAt: null };
      }
      if (language && user.language !== language) {
        user.language = language;
      }
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return { user, token };
  }

  // Forgot password: send verification code
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found', 404);
    }
    const otp = generateOtp();
    user.otpCodeHash = await hashOtp(otp);
    user.otpExpiresAt = getExpiryDate();
    user.otpAttemptCount = 0;
    user.otpLastSentAt = new Date();
    // Limit resets reuse
    user.passwordResetValidUntil = user.otpExpiresAt;
    await user.save();

    try {
      await sendVerificationEmail(user.email, otp);
    } catch (error) {
      logger.warn('Primary mailer failed, trying alternative:', error.message);
      await sendVerificationEmailAlt(user.email, otp);
    }
    return { email: user.email };
  }

  // Verify OTP for password reset
  async verifyPasswordResetOtp(email, code) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found', 404);
    }
    if (!user.otpCodeHash || !user.otpExpiresAt) {
      throw new ApiError(400, 'Invalid or expired code', 411);
    }
    if (isExpired(user.otpExpiresAt)) {
      throw new ApiError(400, 'Invalid or expired code', 412);
    }
    const ok = await compareOtp(code, user.otpCodeHash);
    if (!ok) {
      user.otpAttemptCount = (user.otpAttemptCount || 0) + 1;
      await user.save();
      throw new ApiError(400, 'Invalid or expired code', 414);
    }
    // mark window to allow password change
    user.passwordResetValidUntil = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    return true;
  }

  // Update password after OTP verified
  async resetPassword(email, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new ApiError(404, 'User not found', 404);
    if (!user.passwordResetValidUntil || new Date(user.passwordResetValidUntil) < new Date()) {
      throw new ApiError(400, 'Password reset session expired. Please verify code again.', 420);
    }
    user.password = newPassword;
    // clear reset window & OTP artifacts
    user.passwordResetValidUntil = null;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttemptCount = 0;
    await user.save();
    return user;
  }
}

module.exports = new AuthService();