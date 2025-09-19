const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: Date, required: true },
  score: { type: Number, required: true },
  timezone: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['EyeComfort', 'tbut', 'tmh', 'blink percent', 'blink rate'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Score', ScoreSchema);


