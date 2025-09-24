const express = require('express');
const router = express.Router();
const productReviewController = require('../controllers/productReview.controller');

router.post('/add', productReviewController.add);
router.post('/get', productReviewController.getByTitle);

module.exports = router;


