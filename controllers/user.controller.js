// controllers/user.controller.js
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');
const {successResponse, errorResponse} = require("../utils/responseHandler");
const interestRepository = require('../repositories/interest.repository');
const feedbackRepository = require('../repositories/feedback.repository');
const path = require('path');
const userService = require('../services/user.service');

const {Types} = require("mongoose");

class UserController {
  async getProfile(req, res, next) {
    try {
      const email = req.user.email;
      const user = await userRepository.findProfileByEmail(email);
      if (user && user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
        // Lazy downgrade on profile fetch
        await userRepository.updateSubscription(user._id, { plan: 'free', startedAt: user.subscription.startedAt, expiresAt: null });
        user.subscription.plan = 'free';
        user.subscription.expiresAt = null;
      }
      return successResponse(res, {user}, 'Profile updated successfully', 200, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const {userName} = req.body;
      if (!userName) {
        throw new ApiError(400, 'Email and displayName are required', 700);
      }

      const user = await userRepository.updateDisplayName(req.user.userId, userName);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile updated successfully', 200, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateLanguage(req, res, next) {
    try {
      const {language} = req.body;
      if (!language) {
        throw new ApiError(400, 'Language is required', 700);
      }

      const user = await userRepository.updateLanguage(req.user.userId, language);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile updated successfully', 200, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateCountryTimezone(req, res, next) {
    try {
      const {country, timezone} = req.body;
      if (!country && !timezone) {
        throw new ApiError(400, 'Country and Timezone is required', 705);
      }

      const user = await userRepository.updateCountryTimezone(req.user.userId, country, timezone);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile updated successfully', 203, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updatePrivacyData(req, res, next) {
    try {
      const {consentPersonalDataProcessing, consentToAnonymousDataCollection} = req.body;

      const user = await userRepository.updatePrivacyData(req.user.userId, consentPersonalDataProcessing, consentToAnonymousDataCollection);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile updated successfully', 203, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateCloudDevices(req, res, next) {
    try {
      const {syncAcrossDevices, enableCloudBackup} = req.body;


      const user = await userRepository.updateCloudDevices(req.user.userId, syncAcrossDevices, enableCloudBackup);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile updated successfully', 203, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateEmail(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) throw new ApiError(400, 'Email is required', 706);
      const user = await userRepository.updateEmail(req.user.userId, email);
      if (!user) throw new ApiError(404, 'User not found', 701);
      return successResponse(res, {}, 'Profile updated successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateSubscription(req, res, next) {
    try {
      const { plan, period } = req.body;
      let normalizedPlan = plan;
      if (plan === 'standard') normalizedPlan = `standard_${period}`;
      if (plan === 'premium') normalizedPlan = `premium_${period}`;

      const allowed = ['free','standard_monthly','premium_monthly','premium_yearly'];
      if (!allowed.includes(normalizedPlan)) {
        throw new ApiError(400, 'Invalid plan', 707);
      }

      const now = new Date();
      let expiresAt = null;
      if (normalizedPlan !== 'free') {
        const months = normalizedPlan.endsWith('yearly') ? 12 : 1; // standard only monthly
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + months);
      }

      const subscription = { plan: normalizedPlan, startedAt: now, expiresAt };
      const user = await userRepository.updateSubscription(req.user.userId, subscription);
      if (!user) throw new ApiError(404, 'User not found', 701);
      return successResponse(res, { subscription: user.subscription }, 'Profile updated successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'Avatar image is required', 702);
      }
      const publicBase = process.env.PUBLIC_BASE_URL || '';
      // Build public URL; assume Nginx serves /uploads
      const relativePath = path.join('uploads', 'avatars', path.basename(req.file.path));
      const photoUrl = publicBase ? `${publicBase}/${relativePath.replace(/\\/g, '/')}` : `/${relativePath.replace(/\\/g, '/')}`;

      const user = await userRepository.model.findOneAndUpdate(
        { _id: req.user.userId },
        { photoUrl },
        { new: true }
      );
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, { photoUrl }, 'Profile updated successfully', 200, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async deleteProfile(req, res, next) {
    try {

      const user = await userRepository.deleteUserByEmail(req.user.userId);
      if (!user) throw new ApiError(404, 'User not found', 701);

      return successResponse(res, {}, 'Profile deleted successfully', 206, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async storeInterestForm(req, res, next) {
    try {
      const {firstName, lastName, emailAddress, country} = req.body;
      if (!firstName || !emailAddress) {
        throw new ApiError(400, 'Email and firstName are required', 601);
      }
      const userId = new Types.ObjectId(req.user.userId);
      const dup = await interestRepository.existsDuplicate(userId, firstName, lastName, emailAddress, country);
      if (dup) {
        return errorResponse(res, 'Duplicate interest form detected', 400, 804);
      }
      await interestRepository.saveInterestForm({
        firstName,
        lastName,
        emailAddress,
        country,
        userId
      });

      return successResponse(res, {}, 'Interest Form submitted successfully', 301, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async feedbackForm(req, res, next) {
    try {
      const {rating, feedbackSubject, description, email} = req.body;

      const userId = new Types.ObjectId(req.user.userId);
      const dup = await feedbackRepository.existsDuplicate(userId, rating, feedbackSubject, description, email);
      if (dup) {
        return errorResponse(res, 'Duplicate feedback detected', 400, 803);
      }
      await feedbackRepository.saveFeedback({ rating, feedbackSubject, description, email, userId });

      return successResponse(res, {}, 'Interest Form submitted successfully', 301, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async meetDoctor(req, res, next) {
    try {
      const { firstName, lastName, emailAddress, state, country } = req.body;
      await userService.createMeetDoctor(req.user.userId, firstName, lastName, emailAddress, state, country);
      return successResponse(res, {}, 'Meet doctor request submitted', 302, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async contactSynro(req, res, next) {
    try {
      const { message } = req.body;
      const email = req.user.email;
      const userName = req.user.userName || 'User';
      await userService.sendContactMessage(req.user.userId, email, userName, message);
      return successResponse(res, {}, 'Message sent successfully', 303, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new UserController();