const mongoose = require('mongoose');

const MeetDoctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  emailAddress: { type: String, required: true, trim: true, lowercase: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeetDoctor', MeetDoctorSchema);


