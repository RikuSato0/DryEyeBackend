const BaseRepository = require('./base.repository');
const MeetDoctor = require('../models/MeetDoctor');

class MeetDoctorRepository extends BaseRepository {
  constructor() {
    super(MeetDoctor);
  }

  async existsDuplicate(userId, firstName, lastName, emailAddress, state, country) {
    const count = await MeetDoctor.countDocuments({ userId, firstName, lastName, emailAddress, state, country });
    return count > 0;
  }
}

module.exports = new MeetDoctorRepository();


