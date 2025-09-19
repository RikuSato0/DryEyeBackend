const ApiError = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');

class UserService {
  async getProfile(email) {
    if (!email) throw new ApiError(400, 'Email is required');
    
    const user = await userRepository.findProfileByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');
    
    return user;
  }

  async updateProfile(email, displayName) {
    if (!email || !displayName) {
      throw new ApiError(400, 'Email and display name are required');
    }
    
    const user = await userRepository.updateDisplayName(email, displayName);
    if (!user) throw new ApiError(404, 'User not found');
    
    return user;
  }
}

module.exports = new UserService();