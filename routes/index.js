const express = require('express');
const router = express.Router();
const app = express();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const infoRoutes = require('./info.routes');
const eyeCareRoute = require('./eyeCare.routes');
const trainingRoute = require('./training.routes');
const forumRoutes = require('./forum.routes');
const eyeCareReminderRoutes = require('./eyeCareReminder.routes');
const testRoutes = require('./test.routes');
const scoreRoutes = require('./score.routes');
const productReviewRoutes = require('./productReview.routes');
const productRoutes = require('./product.routes');
const adminRoutes = require('./admin.routes');

const authenticateToken = require('../middlewares/authMiddleware');

router.get('/', (req, res) => {
  res.send('✅ API is running');
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', authenticateToken, userRoutes);
router.use('/info', authenticateToken, infoRoutes);
router.use('/eye-care', eyeCareRoute);
router.use('/reminder', authenticateToken, eyeCareReminderRoutes);
router.use('/training', authenticateToken, trainingRoute);
router.use('/forum', authenticateToken, forumRoutes);
router.use('/test', testRoutes);
router.use('/score', authenticateToken, scoreRoutes);
router.use('/product-review', authenticateToken, productReviewRoutes);
router.use('/product',productRoutes);

module.exports = router;
