const mongoose = require('mongoose');

const VarmkompressSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Varmkompress', VarmkompressSchema);
