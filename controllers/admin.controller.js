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

  async listUsers(req, res, next) {
    try {
      const { email, role, active } = req.body || {};
      const filter = {};
      if (email) filter.email = email;
      if (role) filter.role = role;
      if (active !== undefined) filter.active = String(active).toLowerCase() === 'true' || active === true;
      const users = await adminService.listUsers(filter);
      return successResponse(res, { users }, 'Users fetched', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }

  async setUserActive(req, res, next) {
    try {
      const { userId, active } = req.body || {};
      if (!userId || active === undefined) {
        return errorResponse(res, 'userId and active are required', 400, 600);
      }
      const updated = await adminService.setUserActive(userId, String(active).toLowerCase() === 'true' || active === true);
      return successResponse(res, { user: updated }, 'User updated', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }

  async getUserDetail(req, res, next) {
    try {
      const { userId } = req.body || {};
      if (!userId) return errorResponse(res, 'userId is required', 400, 600);
      const user = await adminService.getUserDetail(userId);
      return successResponse(res, { user }, 'User detail', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId, ...fields } = req.body || {};
      if (!userId) return errorResponse(res, 'userId is required', 400, 600);
      const user = await adminService.updateUserFields(userId, fields);
      return successResponse(res, { user }, 'User updated', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }

  async setUserPassword(req, res, next) {
    try {
      const { userId, newPassword } = req.body || {};
      if (!userId || !newPassword) return errorResponse(res, 'userId and newPassword are required', 400, 600);
      await adminService.setUserPassword(userId, newPassword);
      return successResponse(res, {}, 'Password updated', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }

  async setUserSubscription(req, res, next) {
    try {
      const { userId, subscription } = req.body || {};
      if (!userId || !subscription) return errorResponse(res, 'userId and subscription are required', 400, 600);
      const user = await adminService.setUserSubscription(userId, subscription);
      return successResponse(res, { user }, 'Subscription updated', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400, err.messageCode || 600);
    }
  }
}

module.exports = new AdminController();


