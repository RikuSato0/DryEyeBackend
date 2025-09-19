// controllers/user.controller.js
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');
const {successResponse, errorResponse} = require("../utils/responseHandler");
const interestRepository = require('../repositories/interest.repository');
const feedbackRepository = require('../repositories/feedback.repository');

const {Types} = require("mongoose");

class UserController {
  async getProfile(req, res, next) {
    try {
      const email = req.user.email;
      const user = await userRepository.findProfileByEmail(email);
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
      await interestRepository.saveInterestForm({
        firstName,
        lastName,
        emailAddress,
        country,
        userId: new Types.ObjectId(req.user.userId)
      });

      return successResponse(res, {}, 'Interest Form submitted successfully', 301, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async feedbackForm(req, res, next) {
    try {
      const {rating, feedbackSubject, description, email} = req.body;

      await feedbackRepository.saveFeedback({
        rating,
        feedbackSubject,
        description,
        email,
        userId: new Types.ObjectId(req.user.userId)
      });

      return successResponse(res, {}, 'Interest Form submitted successfully', 301, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new UserController();