const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImage } = require('../middlewares/uploadProductImage');
const adminOnly = require('../middlewares/adminOnly');

router.post('/add', adminOnly, uploadProductImage.single('image'), productController.add);
router.post('/get', productController.list);
router.post('/get-detail', productController.detail);
router.post('/add-review', productController.addReview);
router.post('/update', adminOnly, uploadProductImage.single('image'), productController.update);
router.post('/delete', adminOnly, productController.delete);
router.post('/get-all', adminOnly, productController.getAll);

module.exports = router;


