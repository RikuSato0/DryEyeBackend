const mongoose = require('mongoose');

const RoutineProgressSchema = new mongoose.Schema({
  email: { type: String, required: true },
  routine: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completedCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('RoutineProgress', RoutineProgressSchema);
