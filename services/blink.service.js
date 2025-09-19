const ApiError = require('../utils/apiError');
const blinkRepository = require('../repositories/blink.repository');

class BlinkService {
  async saveResult(email, duration) {
    if (!email || typeof duration !== 'number') {
      throw new ApiError(400, 'Invalid fields');
    }
    return await blinkRepository.create({ email, duration });
  }

  async getHistory(email) {
    return await blinkRepository.findByEmail(email);
  }
}

module.exports = new BlinkService();