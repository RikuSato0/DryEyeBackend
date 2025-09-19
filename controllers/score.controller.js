const scoreService = require('../services/score.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ScoreController {
  async save(req, res, next) {
    try {
      const userId = req.user.userId;
      const { Time, Score, Timezone, type, text } = req.body;
      const doc = await scoreService.save(userId, new Date(Time), Number(Score), Timezone, type, text);
      return successResponse(res, { id: doc._id }, 'Score saved successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async get(req, res, next) {
    try {
      const userId = req.user.userId;
      const { type, period, timezone } = req.body;
      const data = await scoreService.get(userId, type, period, timezone);
      return successResponse(res, { items: data }, 'Scores fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new ScoreController();


