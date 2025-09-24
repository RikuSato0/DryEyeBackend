const BaseRepository = require('./base.repository');
const ProductReview = require('../models/ProductReview');

class ProductReviewRepository extends BaseRepository {
  constructor() {
    super(ProductReview);
  }

  async createReview({ title, score, content, userId }) {
    return await ProductReview.create({ title, score, content, userId });
  }

  async getReviewsByTitle(title) {
    return await ProductReview.find({ title }).sort({ createdAt: -1 });
  }

  async existsDuplicate(userId, title, score, content) {
    const count = await ProductReview.countDocuments({ userId, title, score, content });
    return count > 0;
  }
}

module.exports = new ProductReviewRepository();


