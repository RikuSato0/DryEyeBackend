const FeedbackModel = require('../models/Feedback');

class InterestRepository {
    async saveFeedback(postData) {
        return await FeedbackModel.create(postData);
    }
}

module.exports = new InterestRepository();