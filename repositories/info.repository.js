const InfoText = require('../models/InfoText');

class InfoRepository {
  async findBySlug(slug) {
    return await InfoText.findOne({ slug });
  }
}

module.exports = new InfoRepository();