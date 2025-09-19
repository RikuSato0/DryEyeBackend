const BlinkResult = require('../models/BlinkResult');

class BlinkRepository {
  async create(data) {
    return await BlinkResult.create(data);
  }

  async findByEmail(email) {
    return await BlinkResult.find({ email }).sort({ date: -1 });
  }
}

module.exports = new BlinkRepository();