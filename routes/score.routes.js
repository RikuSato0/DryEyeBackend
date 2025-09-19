const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/score.controller');

router.post('/save', scoreController.save);
router.post('/get', scoreController.get);

module.exports = router;


