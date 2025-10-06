const BaseRepository = require('./base.repository');
const Waitlist = require('../models/Waitlist');

class WaitlistRepository extends BaseRepository {
  constructor() {
    super(Waitlist);
  }

  async existsDuplicate(email, firstName, lastName, state, country) {
    const cnt = await Waitlist.countDocuments({ email, firstName, lastName, state, country });
    return cnt > 0;
  }
}

module.exports = new WaitlistRepository();


