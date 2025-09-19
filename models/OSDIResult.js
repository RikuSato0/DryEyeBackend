const mongoose = require('mongoose');

const OSDIResultSchema = new mongoose.Schema({
  email: { type: String, required: true },
  score: { type: Number, required: true },
  severity: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OSDIResult', OSDIResultSchema);
