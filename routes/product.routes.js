const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImage } = require('../middlewares/uploadProductImage');
const adminOnly = require('../middlewares/adminOnly');
const authenticationToken = require('../middlewares/authMiddleware');

router.post('/add', authenticationToken,adminOnly, uploadProductImage.single('image'), productController.add);
router.post('/get', productController.list);
router.post('/get-detail', productController.detail);
router.post('/add-review', productController.addReview);
router.post('/update', authenticationToken,adminOnly, uploadProductImage.single('image'), productController.update);
router.post('/delete', authenticationToken,adminOnly, productController.delete);
router.post('/get-all', authenticationToken,adminOnly, productController.getAll);

module.exports = router;


