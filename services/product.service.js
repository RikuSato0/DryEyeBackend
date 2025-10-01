const productRepo = require('../repositories/product.repository');
const ApiError = require('../utils/apiError');

class ProductService {
  async addProduct({ title, subtitle, benefits, text, image, features, ingredients, productDetails, country, productType, profiles, reviewCount, rating }) {
    if (!title || !subtitle || !benefits || !text || !image || !country || !productType) {
      throw new ApiError(400, 'title, subtitle, benefits, text, image, country, productType are required', 900);
    }
    const exists = await productRepo.findByTitle(title.trim());
    if (exists) throw new ApiError(400, 'Product with this title already exists', 901);
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [String(val)] : []);
    if (reviewCount) reviewCount = Number(reviewCount);
    if (rating) rating = Number(rating);
    console.log(reviewCount, rating);
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
      profiles: normalizeArray(profiles),
      reviewCount: reviewCount,
      rating: rating
    };
    await productRepo.createProduct(data);
  }

  async listProducts(idOrTitle, country) {
    if (idOrTitle) {
      const one = await productRepo.findByIdOrTitle(idOrTitle, country);
      return one ? [{ id: one._id, title: one.title, subtitle: one.subtitle, image: one.image, productType: one.productType, profiles: one.profiles, reviewCount: one.reviewCount, rating: one.rating }] : [];
    }
    const rows = await productRepo.listAll(country);
    return rows.map(p => ({ id: p._id, title: p.title, subtitle: p.subtitle, image: p.image, productType: p.productType, profiles: p.profiles, reviewCount: p.reviewCount, rating: p.rating }));
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
    // Recalculate rating and reviewCount
    const refreshed = await productRepo.findByIdOrTitle(prod._id, country);
    if (refreshed) {
      const count = (refreshed.reviews || []).length;
      const sum = (refreshed.reviews || []).reduce((acc, r) => acc + (Number(r.score) || 0), 0);
      const avg = count ? Number((sum / count).toFixed(2)) : 0;
      refreshed.reviewCount = count;
      refreshed.rating = avg;
      await refreshed.save();
    }
  }

  async updateProduct(idOrTitle, update) {
    if (!idOrTitle) throw new ApiError(400, 'idOrTitle is required', 908);
    const prod = await productRepo.findByIdOrTitle(idOrTitle, update && update.country);
    if (!prod) throw new ApiError(404, 'Product not found', 902);
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [String(val)] : undefined);
    // Only set provided fields
    if (update.title !== undefined) prod.title = String(update.title).trim();
    if (update.subtitle !== undefined) prod.subtitle = String(update.subtitle).trim();
    if (update.benefits !== undefined) prod.benefits = normalizeArray(update.benefits) || [];
    if (update.text !== undefined) prod.text = String(update.text).trim();
    if (update.image !== undefined) prod.image = String(update.image).trim();
    if (update.features !== undefined) prod.features = normalizeArray(update.features) || [];
    if (update.ingredients !== undefined) prod.ingredients = normalizeArray(update.ingredients) || [];
    if (update.productDetails !== undefined) prod.productDetails = normalizeArray(update.productDetails) || [];
    if (update.country !== undefined) prod.country = String(update.country).trim();
    if (update.productType !== undefined) prod.productType = String(update.productType).trim();
    if (update.profiles !== undefined) prod.profiles = normalizeArray(update.profiles) || [];
    // reviewCount and rating should be computed from reviews; ignore direct overrides
    await prod.save();
  }
}

module.exports = new ProductService();


