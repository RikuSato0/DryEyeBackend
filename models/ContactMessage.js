const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  userName: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);


