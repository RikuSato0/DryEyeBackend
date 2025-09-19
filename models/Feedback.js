const mongoose = require('mongoose');

const FeedbackFormSchema = new mongoose.Schema({
    rating: {type: Number},
    feedbackSubject: {type: String},
    description: {type: String},
    email: {type: String},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ref is optional
});

module.exports = mongoose.model('Feedback', FeedbackFormSchema, 'feedback_form');

