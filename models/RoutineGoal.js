const mongoose = require('mongoose');

const RoutineGoalSchema = new mongoose.Schema({
  email: { type: String, required: true },
  routine: { type: String, required: true }, // t.ex. "blinkträning", "hemmapass"
  type: { type: String, required: true }, // 'eye' eller 'training'
  targetPerDay: { type: Number },         // för ögonrutiner
  targetPerWeek: { type: Number }         // för träningsrutiner
});

module.exports = mongoose.model('RoutineGoal', RoutineGoalSchema);
