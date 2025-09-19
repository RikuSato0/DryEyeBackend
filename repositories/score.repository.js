const BaseRepository = require('./base.repository');
const Score = require('../models/Score');

class ScoreRepository extends BaseRepository {
  constructor() {
    super(Score);
  }

  async findByTimeRange(userId, type, startUtc, endUtc) {
    const filter = { userId };
    if (type) filter.type = type;
    filter.time = { $gte: startUtc, $lte: endUtc };
    return await Score.find(filter).sort({ time: 1 });
  }
}

module.exports = new ScoreRepository();


