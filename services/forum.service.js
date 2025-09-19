const ApiError = require('../utils/apiError');
const forumRepository = require('../repositories/forum.repository');

class ForumService {
  async createPost(postData) {
    return await forumRepository.createPost(postData);
  }

  async getAllPosts() {
    return await forumRepository.getAllPosts();
  }

  async getPostById(postId) {
    const post = await forumRepository.getPostById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    return post;
  }

  async addComment(postId, commentData) {
    const post = await forumRepository.addComment(postId, commentData);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    return post;
  }

  async updatePost(postId, authorId, updateData) {
    try {
      const post = await forumRepository.updatePost(postId, authorId, updateData);
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }
      return post;
    } catch (err) {
      if (err.message === 'Unauthorized') {
        throw new ApiError(403, 'Not authorized to edit this post');
      }
      throw err;
    }
  }

  async deletePost(postId, authorId) {
    try {
      const post = await forumRepository.deletePost(postId, authorId);
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }
      return post;
    } catch (err) {
      if (err.message === 'Unauthorized') {
        throw new ApiError(403, 'Not authorized to delete this post');
      }
      throw err;
    }
  }
}

module.exports = new ForumService();