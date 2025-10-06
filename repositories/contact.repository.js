const BaseRepository = require('./base.repository');
const ContactMessage = require('../models/ContactMessage');

class ContactRepository extends BaseRepository {
  constructor() {
    super(ContactMessage);
  }

  async existsDuplicate(userId, email, userName, message) {
    const count = await ContactMessage.countDocuments({ userId, email, userName, message });
    return count > 0;
  }

  async existsDuplicatePublic(email, userName, message) {
    const count = await ContactMessage.countDocuments({ userId: null, email, userName, message });
    return count > 0;
  }
}

module.exports = new ContactRepository();


