const InterestForm = require('../models/InterestForm');

class InterestRepository {
    async saveInterestForm(postData) {
        return await InterestForm.create(postData);
    }

    async existsDuplicate(userId, firstName, lastName, emailAddress, country) {
        const query = { userId };
        if (firstName) query.firstName = firstName;
        if (lastName) query.lastName = lastName;
        if (emailAddress) query.emailAddress = emailAddress;
        if (country) query.country = country;
        const count = await InterestForm.countDocuments(query);
        return count > 0;
    }
}

module.exports = new InterestRepository();