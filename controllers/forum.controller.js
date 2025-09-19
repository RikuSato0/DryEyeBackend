const ApiResponse = require('../utils/apiResponse');
const forumService = require('../services/forum.service');

class ForumController {
  async createPost(req, res, next) {
    try {
      const post = await forumService.createPost(req.body);
      ApiResponse.success(res, 201, 'Post created', post);
    } catch (err) {
      next(err);
    }
  }

  async getAllPosts(req, res, next) {
    try {
      const posts = await forumService.getAllPosts();
      ApiResponse.success(res, 200, 'Posts retrieved', posts);
    } catch (err) {
      next(err);
    }
  }

  async getPostById(req, res, next) {
    try {
      const post = await forumService.getPostById(req.params.postId);
      ApiResponse.success(res, 200, 'Post retrieved', post);
    } catch (err) {
      next(err);
    }
  }

  async addComment(req, res, next) {
    try {
      const post = await forumService.addComment(
        req.params.postId,
        req.body
      );
      ApiResponse.success(res, 200, 'Comment added', post);
    } catch (err) {
      next(err);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await forumService.updatePost(
        req.params.postId,
        req.body.authorId,
        { text: req.body.text, imageUrl: req.body.imageUrl }
      );
      ApiResponse.success(res, 200, 'Post updated', post);
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req, res, next) {
    try {
      await forumService.deletePost(
        req.params.postId,
        req.body.authorId
      );
      ApiResponse.success(res, 200, 'Post deleted');
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No image attached');
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      ApiResponse.success(res, 200, 'Image uploaded', { imageUrl });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ForumController();