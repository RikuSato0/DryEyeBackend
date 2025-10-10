const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticationToken = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');

router.post('/login', adminController.login);

// user management
router.post('/users', authenticationToken, adminOnly, adminController.listUsers);
router.post('/users/set-active', authenticationToken, adminOnly, adminController.setUserActive);
router.post('/users/detail', authenticationToken, adminOnly, adminController.getUserDetail);
router.post('/users/update', authenticationToken, adminOnly, adminController.updateUser);
router.post('/users/set-password', authenticationToken, adminOnly, adminController.setUserPassword);
router.post('/users/set-subscription', authenticationToken, adminOnly, adminController.setUserSubscription);

module.exports = router;


