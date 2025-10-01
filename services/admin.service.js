const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');

class AdminService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Incorrect email or password', 601);
    }

    // Ensure user is an admin
    if (!user.role || user.role !== 'admin') {
      throw new ApiError(403, 'Admin access only', 602);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect email or password', 603);
    }

    // Update minimal login metadata for auditability
    user.lastLoginAt = new Date();
    await user.save();

    return user;
  }
}

module.exports = new AdminService();


