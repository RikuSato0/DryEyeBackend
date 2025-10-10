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
    default: true
  },
  enableCloudBackup: {
    type: Boolean,
    default: true
  },
  consentPersonalDataProcessing: {
    type: Boolean,
    default: true
  },
  consentToAnonymousDataCollection: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
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
  },
  // Two-factor authentication (2FA)
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorMethod: {
    type: String,
    default: null
  },
  twoFactorTempCodeHash: {
    type: String,
    default: null
  },
  twoFactorTempExpiresAt: {
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
  // Linked identity providers for account linking
  linkedProviders: {
    type: [String],
    default: []
  },
  googleUid: {
    type: String,
    default: null
  },
  appleUid: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  streaks: {
    type: Number,
    default: 0
  },
  passwordResetValidUntil: {
    type: Date,
    default: null
  }
});

// Subscription information
UserSchema.add({
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

UserSchema.add({
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'standard_monthly', 'premium_monthly', 'premium_yearly'],
      default: 'free'
    },
    startedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
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
