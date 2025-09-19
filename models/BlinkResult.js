const mongoose = require('mongoose');

const BlinkResultSchema = new mongoose.Schema({
  email: { type: String, required: true },
  duration: { type: Number, required: true }, // antal sekunder innan blink
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlinkResult', BlinkResultSchema);
