const productReviewService = require('../services/productReview.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ProductReviewController {
  async add(req, res, next) {
    try {
      const userId = req.user && req.user.userId ? req.user.userId : null;
      await productReviewService.addReview(userId, req.body || {});
      return successResponse(res, {}, 'Review added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async getByTitle(req, res, next) {
    try {
      const { title } = req.body || {};
      const reviews = await productReviewService.getReviewsByTitle(title);
      return successResponse(res, { reviews }, 'Reviews fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new ProductReviewController();


