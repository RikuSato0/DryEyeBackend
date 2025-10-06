const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Waitlist', WaitlistSchema);


