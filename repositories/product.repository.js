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

  async listAll() {
    return await Product.find({}).sort({ createdAt: -1 });
  }

  async findByIdOrTitle(idOrTitle) {
    if (!idOrTitle) return null;
    if (Types.ObjectId.isValid(idOrTitle)) return await Product.findById(idOrTitle);
    return await this.findByTitle(idOrTitle);
  }

  async deleteByIdOrTitle(idOrTitle) {
    if (Types.ObjectId.isValid(idOrTitle)) return await Product.findByIdAndDelete(idOrTitle);
    return await Product.findOneAndDelete({ title: idOrTitle });
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


