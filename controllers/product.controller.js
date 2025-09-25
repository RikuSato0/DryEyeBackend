const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ProductController {
  async add(req, res) {
    try {
      const { title, subtitle, benefits, text, image, features, ingredients, productDetails } = req.body || {};
      await productService.addProduct({ title, subtitle, benefits, text, image, features, ingredients, productDetails });
      return successResponse(res, {}, 'Product added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async list(req, res) {
    try {
      const items = await productService.listProducts();
      return successResponse(res, { items }, 'Products fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async detail(req, res) {
    try {
      const { idOrTitle } = req.body || {};
      const product = await productService.getProductDetail(idOrTitle);
      return successResponse(res, { product }, 'Product detail fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async addReview(req, res) {
    try {
      const userId = req.user.userId;
      const { idOrTitle, score, content } = req.body || {};
      await productService.addReview(userId, { idOrTitle, score, content });
      return successResponse(res, {}, 'Review added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async delete(req, res) {
    try {
      const { idOrTitle } = req.body || {};
      await productService.deleteProduct(idOrTitle);
      return successResponse(res, {}, 'Product deleted successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new ProductController();


