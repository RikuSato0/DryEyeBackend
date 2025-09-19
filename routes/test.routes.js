const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');

// Test routes (remove in production)
router.get('/smtp', testController.testSmtp);
router.get('/smtp-detailed', testController.testSmtpDetailed);
router.post('/email', testController.testEmail);
router.get('/env', testController.getEnvStatus);

module.exports = router;
