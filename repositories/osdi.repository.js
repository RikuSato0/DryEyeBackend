const OSDIResult = require('../models/OSDIResult');

class OSDIRepository {
  async create(data) {
    return await OSDIResult.create(data);
  }

  async findByEmail(email) {
    return await OSDIResult.find({ email }).sort({ date: -1 });
  }

  async deleteById(email, id) {
    return await OSDIResult.deleteOne({ _id: id, email });
  }
}

module.exports = new OSDIRepository();