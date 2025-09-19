// config/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
      // add other user properties you want to include
    },
    config.JWT_SECRET,
    { expiresIn: '1h' } // token expires in 1 hour
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};