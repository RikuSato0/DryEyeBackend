const mongoose = require('mongoose');

const WeeklyGoalSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  trainingDays: { type: Number, default: 5 },
  eyeRoutineDays: { type: Number, default: 7 }
});

module.exports = mongoose.model('WeeklyGoal', WeeklyGoalSchema);
