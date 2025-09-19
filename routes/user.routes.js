// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/uploadAvatar');


router.get('/name', userController.getProfile);
router.get('/profile', userController.getProfile);
router.put('/userName', userController.updateProfile);
router.delete('/deleteAccount', userController.deleteProfile);
router.put('/setLanguage', userController.updateLanguage);
router.put('/cloudDevices', userController.updateCloudDevices);
router.put('/privacyData', userController.updatePrivacyData);
router.put('/countryTimezone', userController.updateCountryTimezone);
router.put('/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);
router.put('/email', userController.updateEmail);
router.put('/subscription', userController.updateSubscription);
router.post('/meetDoctor', userController.meetDoctor);
router.post('/contact', userController.contactSynro);

router.post('/interest', userController.storeInterestForm);
router.post('/feedback', userController.feedbackForm);


module.exports = router;