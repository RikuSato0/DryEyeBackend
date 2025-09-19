const mongoose = require('mongoose');

const InterestFormSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    emailAddress: {type: String},
    country: {type: String},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ref is optional
});

module.exports = mongoose.model('InterestForm', InterestFormSchema, 'interest_form');

