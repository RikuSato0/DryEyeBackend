const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.post('/add', productController.add);
router.post('/get', productController.list);
router.post('/get-detail', productController.detail);
router.post('/add-review', productController.addReview);
router.post('/delete', productController.delete);

module.exports = router;


