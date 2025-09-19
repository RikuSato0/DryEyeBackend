const ApiError = require('../utils/apiError');
const osdiRepository = require('../repositories/osdi.repository');

class OSDIService {
  async saveResult(email, score, severity) {
    return await osdiRepository.create({ email, score, severity });
  }

  async getHistory(email) {
    return await osdiRepository.findByEmail(email);
  }

  async deleteResult(email, id) {
    const result = await osdiRepository.deleteById(email, id);
    if (!result.deletedCount) {
      throw new ApiError(404, 'Test not found');
    }
    return result;
  }
}

module.exports = new OSDIService();