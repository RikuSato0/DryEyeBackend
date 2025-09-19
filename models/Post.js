const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  authorId: String,         // <-- intern identitet
  authorName: String,       // <-- visat namn
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  authorId: String,         // <-- intern identitet (e-post)
  authorName: String,       // <-- visat namn i forum
  text: String,
  imageUrl: String,
  comments: [CommentSchema],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
