const ApiResponse = require('../utils/apiResponse');
const blinkService = require('../services/blink.service');

class BlinkController {
  async saveResult(req, res, next) {
    try {
      const { email, duration } = req.body;
      await blinkService.saveResult(email, duration);
      ApiResponse.success(res, 201, 'Blink result saved');
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const results = await blinkService.getHistory(req.params.email);
      ApiResponse.success(res, 200, 'Blink history retrieved', results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BlinkController();