const BaseRepository = require('./base.repository');
const Product = require('../models/Product');
const { Types } = require('mongoose');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async createProduct(data) {
    return await Product.create(data);
  }

  async findByTitle(title) {
    return await Product.findOne({ title });
  }

  async listAll(country, filters) {
    const filter = country ? { country } : {};
    if (filters && filters.productType) {
      filter.productType = filters.productType;
    }
    if (filters && Array.isArray(filters.profiles) && filters.profiles.length) {
      filter.profiles = { $all: filters.profiles };
    }
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async findByIdOrTitle(idOrTitle, country) {
    if (!idOrTitle) return null;
    if (Types.ObjectId.isValid(idOrTitle)) {
      const byId = await Product.findOne({ _id: idOrTitle, ...(country ? { country } : {}) });
      if (byId) return byId;
    }
    return await Product.findOne({ title: idOrTitle, ...(country ? { country } : {}) });
  }

  async deleteByIdOrTitle(idOrTitle, country) {
    if (Types.ObjectId.isValid(idOrTitle)) return await Product.findOneAndDelete({ _id: idOrTitle, ...(country ? { country } : {}) });
    return await Product.findOneAndDelete({ title: idOrTitle, ...(country ? { country } : {}) });
  }

  async addReview(productId, userId, score, content) {
    return await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: { userId, score, content, createdAt: new Date() } } },
      { new: true }
    );
  }

  async hasDuplicateReview(productId, userId, score, content) {
    const prod = await Product.findOne({ _id: productId, reviews: { $elemMatch: { userId, score, content } } });
    return !!prod;
  }
}

module.exports = new ProductRepository();


