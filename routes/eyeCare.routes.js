const express = require('express');
const router = express.Router();
const osdiController = require('../controllers/osdi.controller');
const blinkController = require('../controllers/blink.controller');
const routineController = require('../controllers/routine.controller');
const { EYE_ROUTINES } = require('../config/constants');

// OSDI Routes
router.get('/', (req, res) => {
  res.send('✅ Eye Care API is running');
});

router.post('/osdi', osdiController.saveResult);
router.get('/osdi/:email', osdiController.getHistory);
router.delete('/osdi/:email/:id', osdiController.deleteResult);

router.post('/dry-eye-product-finder-result', osdiController.diagnoseDryEyeGenerateResult);
router.post('/osdi-generate-result', osdiController.OSDIGenerateResult);

router.post('/demodex-risk-check', osdiController.demodexRiskCheckGenerateResult);


// Blink Routes
router.post('/blink', blinkController.saveResult);
router.get('/blink/:email', blinkController.getHistory);

// Routine Routes
EYE_ROUTINES.forEach(routine => {
  router.post(`/status/${routine}`, routineController.updateStatus);
  router.get(`/status/${routine}`, routineController.getStatus);
});

router.get('/ogonstatus/:email', routineController.getDailyStatus);
router.get('/ogonstatus/extended/:email', routineController.getExtendedStatus);

module.exports = router;