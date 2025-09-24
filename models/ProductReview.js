const mongoose = require('mongoose');

const ProductReviewSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0, max: 5 },
  content: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ProductReviewSchema.index({ title: 1, createdAt: -1 });

module.exports = mongoose.model('ProductReview', ProductReviewSchema, 'product_reviews');


