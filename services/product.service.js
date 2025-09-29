const productRepo = require('../repositories/product.repository');
const ApiError = require('../utils/apiError');

class ProductService {
  async addProduct({ title, subtitle, benefits, text, image, features, ingredients, productDetails, country, productType, profiles }) {
    if (!title || !subtitle || !benefits || !text || !image || !country || !productType) {
      throw new ApiError(400, 'title, subtitle, benefits, text, image, country, productType are required', 900);
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
      country: String(country).trim(),
      features: normalizeArray(features),
      ingredients: normalizeArray(ingredients),
      productDetails: normalizeArray(productDetails),
      productType: String(productType).trim(),
      profiles: normalizeArray(profiles)
    };
    await productRepo.createProduct(data);
  }

  async listProducts(country, filters) {
    const rows = await productRepo.listAll(country, filters);
    return rows.map(p => ({ id: p._id, title: p.title, subtitle: p.subtitle, image: p.image, productType: p.productType, profiles: p.profiles }));
  }

  async getProductDetail(idOrTitle, country) {
    const prod = await productRepo.findByIdOrTitle(idOrTitle, country);
    if (!prod) throw new ApiError(404, 'Product not found', 902);
    return prod;
  }

  async deleteProduct(idOrTitle, country) {
    const deleted = await productRepo.deleteByIdOrTitle(idOrTitle, country);
    if (!deleted) throw new ApiError(404, 'Product not found', 903);
  }

  async addReview(userId, { idOrTitle, country, score, content }) {
    if (!idOrTitle || !country || score === undefined || score === null || !content) {
      throw new ApiError(400, 'idOrTitle, score, content are required', 904);
    }
    if (typeof score !== 'number' || score < 0 || score > 5) {
      throw new ApiError(400, 'score must be 0..5', 905);
    }
    const prod = await productRepo.findByIdOrTitle(idOrTitle, country);
    if (!prod) throw new ApiError(404, 'Product not found', 906);
    const dup = await productRepo.hasDuplicateReview(prod._id, userId, score, content.trim());
    if (dup) throw new ApiError(400, 'Duplicate product review', 907);
    await productRepo.addReview(prod._id, userId, score, content.trim());
  }
}

module.exports = new ProductService();


