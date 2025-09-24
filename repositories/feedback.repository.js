const FeedbackModel = require('../models/Feedback');

class InterestRepository {
    async saveFeedback(postData) {
        return await FeedbackModel.create(postData);
    }

    async existsDuplicate(userId, rating, feedbackSubject, description, email) {
        const query = { userId };
        if (rating !== undefined) query.rating = rating;
        if (feedbackSubject) query.feedbackSubject = feedbackSubject;
        if (description) query.description = description;
        if (email) query.email = email;
        const count = await FeedbackModel.countDocuments(query);
        return count > 0;
    }
}

module.exports = new InterestRepository();