const bcrypt = require('bcrypt');

const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);

function generateOtp(length = OTP_LENGTH) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOtp(plainOtp, hash) {
  return bcrypt.compare(plainOtp, hash);
}

function getExpiryDate(now = new Date()) {
  return new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);
}

function isExpired(expiryDate, now = new Date()) {
  if (!expiryDate) return true;
  return now.getTime() > new Date(expiryDate).getTime();
}

function isCooldownOver(lastSentAt, now = new Date()) {
  if (!lastSentAt) return true;
  const nextAllowed = new Date(new Date(lastSentAt).getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000);
  return now.getTime() >= nextAllowed.getTime();
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  getExpiryDate,
  isExpired,
  isCooldownOver
};


