const mongoose = require('mongoose');

const routineEntrySchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, required: true }, 
  routine: { type: String, required: true },
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

routineEntrySchema.index({ email: 1, routine: 1, date: 1, timestamp: 1 });

module.exports = mongoose.model('RoutineEntry', routineEntrySchema);
