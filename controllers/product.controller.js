const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ProductController {
  async add(req, res) {
    try {
      const publicBase = process.env.PUBLIC_BASE_URL || '';
      const imagePath = req.file ? (publicBase ? `${publicBase}/uploads/products/${req.file.filename}` : `/uploads/products/${req.file.filename}`) : (req.body && req.body.image);
      const { title, subtitle, benefits, text,reviewCount, rating, features, ingredients, productDetails, country, productType, profiles, active } = req.body || {};
      const affiliateLink = (req.body && (req.body.affiliateLink || req.body.affiliate_link)) || undefined;
      const purchaseLink = (req.body && (req.body.purchaseLink || req.body.purchase_link)) || undefined;
      console.log(imagePath,"imagePath")
      await productService.addProduct({ title, subtitle, benefits, text, image: imagePath, features, ingredients, productDetails, country, productType, profiles, reviewCount, rating, active, affiliateLink, purchaseLink });
      return successResponse(res, {}, 'Product added successfully', 200, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async list(req, res) {
    try {
      const { idOrTitle, country } = req.body || {};
      const items = await productService.listProducts(idOrTitle, country);
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

  async update(req, res) {
    try {
      const publicBase = process.env.PUBLIC_BASE_URL || '';
      const imagePath = req.file ? (publicBase ? `${publicBase}/uploads/products/${req.file.filename}` : `/uploads/products/${req.file.filename}`) : (req.body && req.body.image);
      const { idOrTitle, title, subtitle, benefits, text, features, ingredients, productDetails, country, productType, profiles, reviewCount, rating, active } = req.body || {};
      const affiliateLinkU = (req.body && (req.body.affiliateLink || req.body.affiliate_link)) || undefined;
      const purchaseLinkU = (req.body && (req.body.purchaseLink || req.body.purchase_link)) || undefined;
      await productService.updateProduct(idOrTitle, { title, subtitle, benefits, text, image: imagePath, features, ingredients, productDetails, country, productType, profiles, reviewCount, rating, active, affiliateLink: affiliateLinkU, purchaseLink: purchaseLinkU });
      return successResponse(res, {}, 'Product updated successfully', 200, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async getAll(req, res) {
    try {
      const products = await productService.getAllProducts();
      return successResponse(res, { products }, 'All products fetched successfully', 200, 200);
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


