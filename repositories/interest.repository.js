const InterestForm = require('../models/InterestForm');

class InterestRepository {
    async saveInterestForm(postData) {
        return await InterestForm.create(postData);
    }
}

module.exports = new InterestRepository();