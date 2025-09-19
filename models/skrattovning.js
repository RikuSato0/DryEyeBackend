const mongoose = require('mongoose');

const SkrattovningSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true }, // t.ex. "2025-06-06"
  count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Skrattovning', SkrattovningSchema);
