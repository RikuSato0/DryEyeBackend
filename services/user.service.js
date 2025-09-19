const ApiError = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');
const meetDoctorRepository = require('../repositories/meetDoctor.repository');
const contactRepository = require('../repositories/contact.repository');
const {  sendContactEmail } = require('../utils/mailer');

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

  async createMeetDoctor(userId, firstName, lastName, emailAddress, state, country) {
    if (!firstName || !lastName || !emailAddress || !state || !country) {
      throw new ApiError(400, 'All fields are required');
    }
    return await meetDoctorRepository.create({ userId, firstName, lastName, emailAddress, state, country });
  }

  async sendContactMessage(userId, email, userName, message) {
    if (!email || !userName || !message) throw new ApiError(400, 'email, userName and message are required');
    const saved = await contactRepository.create({ userId, email, userName, message });
    try {
      await sendContactEmail('satoriku955@gmail.com', userName, email, message);
    } catch (e) {
      // ignore email failure but keep saved
    }
    return saved;
  }
}

module.exports = new UserService();