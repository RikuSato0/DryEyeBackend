const productReviewRepo = require('../repositories/productReview.repository');
const ApiError = require('../utils/apiError');

class ProductReviewService {
  async addReview(userId, { title, score, content }) {
    if (!title || (!title.trim || !title.trim())) throw new ApiError(400, 'title is required', 700);
    if (score === undefined || score === null) throw new ApiError(400, 'score is required', 701);
    if (typeof score !== 'number' || score < 0 || score > 5) throw new ApiError(400, 'score must be 0..5', 702);
    if (!content || (!content.trim || !content.trim())) throw new ApiError(400, 'content is required', 703);
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    if (userId) {
      const dup = await productReviewRepo.existsDuplicate(userId, normalizedTitle, score, normalizedContent);
      if (dup) throw new ApiError(400, 'Duplicate review detected', 705);
    }
    return await productReviewRepo.createReview({ title: normalizedTitle, score, content: normalizedContent, userId });
  }

  async getReviewsByTitle(title) {
    if (!title || (!title.trim || !title.trim())) throw new ApiError(400, 'title is required', 704);
    return await productReviewRepo.getReviewsByTitle(title.trim());
  }
}

module.exports = new ProductReviewService();


