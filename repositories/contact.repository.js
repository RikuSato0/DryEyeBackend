const BaseRepository = require('./base.repository');
const ContactMessage = require('../models/ContactMessage');

class ContactRepository extends BaseRepository {
  constructor() {
    super(ContactMessage);
  }
}

module.exports = new ContactRepository();


