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

  async listUsers(filter) {
    return await userRepository.listUsers(filter);
  }

  async setUserActive(userId, active) {
    const user = await userRepository.setActive(userId, active);
    if (!user) {
      throw new ApiError(404, 'User not found', 604);
    }
    return user;
  }

  async getUserDetail(userId) {
    const user = await userRepository.findPublicById(userId);
    if (!user) throw new ApiError(404, 'User not found', 604);
    return user;
  }

  async updateUserFields(userId, fields) {
    const allowed = ['userName','country','timezone','language','role','active','syncAcrossDevices','enableCloudBackup','consentPersonalDataProcessing','consentToAnonymousDataCollection'];
    const data = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        if (typeof fields[key] === 'string') data[key] = fields[key];
        else data[key] = fields[key];
      }
    }
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, 'No updatable fields provided', 605);
    }
    const updated = await userRepository.model.findOneAndUpdate({ _id: userId }, data, { new: true }).select('-password');
    if (!updated) throw new ApiError(404, 'User not found', 604);
    return updated;
  }

  async setUserPassword(userId, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found', 604);
    user.password = newPassword;
    await user.save();
    return true;
  }

  async setUserSubscription(userId, subscription) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found', 604);
    user.subscription = subscription;
    await user.save();
    return user;
  }
}

module.exports = new AdminService();


