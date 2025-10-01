const jwt = require('jsonwebtoken');
const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class AdminController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return errorResponse(res, 'email and password are required', 400, 600);
      }

      const admin = await adminService.login(email, password);

      const token = jwt.sign(
        {
          userId: admin._id,
          email: admin.email,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      return successResponse(res, {
        admin: {
          id: admin._id,
          email: admin.email,
          role: 'admin'
        },
        token
      }, 'Admin login successful', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }
}

module.exports = new AdminController();


