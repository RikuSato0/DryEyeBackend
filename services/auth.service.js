const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateOtp, hashOtp, compareOtp, getExpiryDate, isExpired, isCooldownOver } = require('../utils/otp');
const { sendVerificationEmail } = require('../utils/mailer');
const { sendVerificationEmail: sendVerificationEmailAlt } = require('../utils/mailer-alternative');

const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_DAILY_RESEND_LIMIT = Number(process.env.OTP_DAILY_RESEND_LIMIT || 5);

class AuthService {
  async register(email, password, userName, country, timezone) {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new ApiError(400, 'The email address is already registered', 408);
    }
    const user = await userRepository.create({ email, password, userName, country, timezone, isVerified: false });

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

  async login(email, password) {
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
}

module.exports = new AuthService();