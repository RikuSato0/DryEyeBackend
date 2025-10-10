const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 5 },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  subtitle: { type: String, required: true, trim: true },
  features: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  productDetails: { type: [String], default: [] },
  benefits: { type: [String], required: true },
  text: { type: String, required: true },
  image: { type: String, required: true },
  country: { type: String, required: true, enum: ['US','NO','SE'] },
  productType: { type: String, required: true, trim: true },
  profiles: { type: [String], default: [] },
  reviews: { type: [ReviewSchema], default: [] },
  reviewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  affiliateLink: { type: String, default: '' },
  purchaseLink: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

ProductSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema, 'products');


