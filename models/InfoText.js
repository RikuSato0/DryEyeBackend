const mongoose = require('mongoose');

const InfoTextSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('InfoText', InfoTextSchema, 'info_text');

