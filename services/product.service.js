const productRepo = require('../repositories/product.repository');
const ApiError = require('../utils/apiError');

class ProductService {
  async addProduct({ title, subtitle, benefits, text, image, features, ingredients, productDetails }) {
    if (!title || !subtitle || !benefits || !text || !image) {
      throw new ApiError(400, 'title, subtitle, benefits, text, image are required', 900);
    }
    const exists = await productRepo.findByTitle(title.trim());
    if (exists) throw new ApiError(400, 'Product with this title already exists', 901);
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [String(val)] : []);
    const data = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      benefits: normalizeArray(benefits),
      text: text.trim(),
      image: image.trim(),
      features: normalizeArray(features),
      ingredients: normalizeArray(ingredients),
      productDetails: normalizeArray(productDetails)
    };
    await productRepo.createProduct(data);
  }

  async listProducts() {
    const rows = await productRepo.listAll();
    return rows.map(p => ({ id: p._id, title: p.title, subtitle: p.subtitle, image: p.image }));
  }

  async getProductDetail(idOrTitle) {
    const prod = await productRepo.findByIdOrTitle(idOrTitle);
    if (!prod) throw new ApiError(404, 'Product not found', 902);
    return prod;
  }

  async deleteProduct(idOrTitle) {
    const deleted = await productRepo.deleteByIdOrTitle(idOrTitle);
    if (!deleted) throw new ApiError(404, 'Product not found', 903);
  }

  async addReview(userId, { idOrTitle, score, content }) {
    if (!idOrTitle || score === undefined || score === null || !content) {
      throw new ApiError(400, 'idOrTitle, score, content are required', 904);
    }
    if (typeof score !== 'number' || score < 0 || score > 5) {
      throw new ApiError(400, 'score must be 0..5', 905);
    }
    const prod = await productRepo.findByIdOrTitle(idOrTitle);
    if (!prod) throw new ApiError(404, 'Product not found', 906);
    const dup = await productRepo.hasDuplicateReview(prod._id, userId, score, content.trim());
    if (dup) throw new ApiError(400, 'Duplicate product review', 907);
    await productRepo.addReview(prod._id, userId, score, content.trim());
  }
}

module.exports = new ProductService();


