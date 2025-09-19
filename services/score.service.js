const ApiError = require('../utils/apiError');
const scoreRepository = require('../repositories/score.repository');
const moment = require('moment-timezone');

class ScoreService {
  async save(userId, time, score, timezone, type, text) {
    if (!time || typeof score !== 'number' || !timezone || !type) {
      throw new ApiError(400, 'time, score, timezone and type are required', 700);
    }
    const doc = await scoreRepository.create({ userId, time, score, timezone, type ,text});
    return doc;
  }

  async get(userId, type, period, requestTz) {
    if (!period || !requestTz) throw new ApiError(400, 'period and timezone are required', 700);
    const now = moment.tz(requestTz);
    let start;
    if (period === 'last_three_month') start = now.clone().subtract(3, 'months');
    else if (period === 'last_six_month') start = now.clone().subtract(6, 'months');
    else if (period === 'last_year') start = now.clone().subtract(1, 'year');
    else throw new ApiError(400, 'Invalid period', 701);

    const startUtc = start.clone().toDate();
    const endUtc = now.clone().toDate();
    const rows = await scoreRepository.findByTimeRange(userId, type, startUtc, endUtc);

    // Convert each stored UTC time to the requested timezone for response
    const data = rows.map(r => ({
      id: r._id,
      time: moment(r.time).tz(requestTz).format(),
      score: r.score,
      text: r.text,
      timezone: requestTz,
      type: r.type
    }));
    return data;
  }
}

module.exports = new ScoreService();


