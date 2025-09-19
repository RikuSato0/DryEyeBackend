const BaseRepository = require('./base.repository');
const User = require('../models/User');
const { Types } = require("mongoose");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async updateDisplayName(userId, userName) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { userName },
      { new: true }
    );
  }

  async updateLanguage(userId, language) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { language },
      { new: true }
    );
  }

  async updateEmail(userId, newEmail) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { email: newEmail }, { new: true });
  }

  async updateSubscription(userId, subscription) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { subscription }, { new: true });
  }

  async updatePrivacyData(userId, consentPersonalDataProcessing, consentToAnonymousDataCollection) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { consentPersonalDataProcessing, consentToAnonymousDataCollection },
      { new: true }
    );
  }

  async updateCloudDevices(userId, syncAcrossDevices, enableCloudBackup) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { syncAcrossDevices, enableCloudBackup },
      { new: true }
    );
  }

  async updateCountryTimezone(userId, country, timezone) {
    return await this.model.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { country, timezone },
      { new: true }
    );
  }

  async updatePassword(email, newPassword) {
    const user = await User.findOne({ email });
    if (!user) return null;
    user.password = newPassword;
    return await user.save();
  }

  async findProfileByEmail(email) {
    return await User.findOne({ email }).select('-password');
  }

  async deleteUserByEmail(userId) {
    return await User.deleteOne({ _id: new Types.ObjectId(userId) });
  }

}

module.exports = new UserRepository();