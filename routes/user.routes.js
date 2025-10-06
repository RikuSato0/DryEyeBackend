// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/uploadAvatar');


router.get('/name',authenticateToken, userController.getProfile);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/userName',authenticateToken, userController.updateProfile);
router.delete('/deleteAccount', authenticateToken, userController.deleteProfile);
router.put('/setLanguage', authenticateToken, userController.updateLanguage);
router.put('/cloudDevices', authenticateToken, userController.updateCloudDevices);
router.put('/privacyData', authenticateToken, userController.updatePrivacyData);
router.put('/countryTimezone', authenticateToken, userController.updateCountryTimezone);
router.put('/avatar',authenticateToken, uploadAvatar.single('avatar'), userController.updateAvatar);
router.put('/email', authenticateToken, userController.updateEmail);
router.put('/subscription',authenticateToken, userController.updateSubscription);
router.post('/meetDoctor', userController.meetDoctor);
router.post('/waitlist', userController.waitlist);
router.post('/contact',authenticateToken, userController.contactSynro);
router.post('/contact/website', userController.contactWebsite);

router.post('/interest',authenticateToken, userController.storeInterestForm);
router.post('/feedback',authenticateToken, userController.feedbackForm);


module.exports = router;