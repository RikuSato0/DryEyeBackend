const ApiError = require('../utils/apiError');
const infoRepository = require('../repositories/info.repository');

class InfoService {
  async getInfoBySlug(slug) {
    const info = await infoRepository.findBySlug(slug);
    if (!info) {
      throw new ApiError(404, 'Information not found');
    }
    return info;
  }
}

module.exports = new InfoService();