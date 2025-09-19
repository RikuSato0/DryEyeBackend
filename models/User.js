const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: ''
  },
  syncAcrossDevices: {
    type: Boolean,
    default: false
  },
  enableCloudBackup: {
    type: Boolean,
    default: false
  },
  consentPersonalDataProcessing: {
    type: Boolean,
    default: false
  },
  consentToAnonymousDataCollection: {
    type: Boolean,
    default: false
  },
  // Email verification & OTP fields
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCodeHash: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpAttemptCount: {
    type: Number,
    default: 0
  },
  otpResendCount: {
    type: Number,
    default: 0
  },
  otpLastSentAt: {
    type: Date,
    default: null
  }
});

// Social auth metadata
UserSchema.add({
  firebaseUid: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: [null, 'google', 'apple', 'facebook'],
    default: null
  },
  photoUrl: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// Add the comparePassword method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
