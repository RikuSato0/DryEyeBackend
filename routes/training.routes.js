const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');

// Training Goals
router.get('/api/goals/training/:email', trainingController.resetTrainingGoals);
router.post('/api/goals/training/save', trainingController.saveTrainingGoals);
router.get('/api/routine-goals', trainingController.getTrainingGoals);
router.post('/api/routine-goals', trainingController.saveTrainingGoals);

// Training Status
router.get('/api/trainingstatus/extended/:email', trainingController.getExtendedStatus);

// Routine Entries
router.post('/api/entry/training', trainingController.createTrainingEntry);
router.delete('/api/entry/training', trainingController.deleteTrainingEntry);

// Training Log
router.post('/api/status/training', trainingController.updateTrainingStatus);
router.get('/api/status/training', trainingController.getTrainingStatus);

// Weekly Goals
router.post('/api/weekly-goal', trainingController.updateWeeklyGoal);
router.get('/api/weekly-goal', trainingController.getWeeklyGoal);

// Progress Tracking
router.post('/api/routine-progress/increment', trainingController.incrementProgress);
router.post('/api/routine-progress/decrement', trainingController.decrementProgress);
router.get('/api/routine-progress/status', trainingController.getProgressStatus);
router.post('/api/routine-progress', trainingController.createTrainingEntry);

module.exports = router;