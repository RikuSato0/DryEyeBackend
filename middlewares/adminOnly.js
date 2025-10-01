module.exports = function adminOnly(req, res, next) {
  // req.user is set by authenticateToken middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only', messageCode: 602 });
  }
  next();
};


