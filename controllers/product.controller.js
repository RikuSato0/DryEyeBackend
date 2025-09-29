const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ProductController {
  async add(req, res) {
    try {
      const publicBase = process.env.PUBLIC_BASE_URL || '';
      const imagePath = req.file ? (publicBase ? `${publicBase}/uploads/products/${req.file.filename}` : `/uploads/products/${req.file.filename}`) : (req.body && req.body.image);
      const { title, subtitle, benefits, text, features, ingredients, productDetails, country } = req.body || {};
      await productService.addProduct({ title, subtitle, benefits, text, image: imagePath, features, ingredients, productDetails, country });
      return successResponse(res, {}, 'Product added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async list(req, res) {
    try {
      const { country } = req.body || {};
      const items = await productService.listProducts(country);
      return successResponse(res, { items }, 'Products fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async detail(req, res) {
    try {
      const { idOrTitle, country } = req.body || {};
      const product = await productService.getProductDetail(idOrTitle, country);
      return successResponse(res, { product }, 'Product detail fetched successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async addReview(req, res) {
    try {
      const userId = req.user.userId;
      const { idOrTitle, country, score, content } = req.body || {};
      await productService.addReview(userId, { idOrTitle, country, score, content });
      return successResponse(res, {}, 'Review added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async delete(req, res) {
    try {
      const { idOrTitle, country } = req.body || {};
      await productService.deleteProduct(idOrTitle, country);
      return successResponse(res, {}, 'Product deleted successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
}

module.exports = new ProductController();


