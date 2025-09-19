const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

// Posts
router.post('/api/forum/posts', forumController.createPost);
router.get('/api/forum/posts', forumController.getAllPosts);
router.get('/api/forum/posts/:postId', forumController.getPostById);
router.post('/api/forum/posts/:postId/comments', forumController.addComment);
router.put('/api/forum/posts/:postId', forumController.updatePost);
router.delete('/api/forum/posts/:postId', forumController.deletePost);

// Image upload
router.post('/api/forum/upload', upload.single('image'), forumController.uploadImage);

// Static files
router.use('/uploads', express.static(uploadDir));

module.exports = router;