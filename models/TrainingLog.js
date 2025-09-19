const mongoose = require('mongoose');

const trainingLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  routines: { type: Object, default: {} }
}, { minimize: false }); // preserve empty objects

module.exports = mongoose.model('TrainingLog', trainingLogSchema);