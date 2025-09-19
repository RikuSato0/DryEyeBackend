const BaseRepository = require('./base.repository');
const MeetDoctor = require('../models/MeetDoctor');

class MeetDoctorRepository extends BaseRepository {
  constructor() {
    super(MeetDoctor);
  }
}

module.exports = new MeetDoctorRepository();


