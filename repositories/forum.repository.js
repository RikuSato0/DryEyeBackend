const Post = require('../models/Post');
const User = require('../models/User');

class ForumRepository {
  async createPost(postData) {
    if (!postData.authorName && postData.authorId) {
      const user = await User.findOne({ email: postData.authorId });
      postData.authorName = user?.displayName || 'Anonymous';
    }
    return await Post.create(postData);
  }

  async getAllPosts() {
    return await Post.find({}, '-authorId').sort({ timestamp: -1 });
  }

  async getPostById(postId) {
    return await Post.findById(postId).select('-authorId');
  }

  async addComment(postId, commentData) {
    if (!commentData.authorName && commentData.authorId) {
      const user = await User.findOne({ email: commentData.authorId });
      commentData.authorName = user?.displayName || 'Anonymous';
    }
    
    return await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: commentData } },
      { new: true }
    );
  }

  async updatePost(postId, authorId, updateData) {
    const post = await Post.findById(postId);
    if (!post) return null;
    if (post.authorId !== authorId) throw new Error('Unauthorized');
    
    return await Post.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true }
    );
  }

  async deletePost(postId, authorId) {
    const post = await Post.findById(postId);
    if (!post) return null;
    if (post.authorId !== authorId) throw new Error('Unauthorized');
    
    return await Post.findByIdAndDelete(postId);
  }
}

module.exports = new ForumRepository();