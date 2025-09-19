const express = require('express');
const eyeRoutineReminderController = require("../controllers/eyeRoutineReminder.controller");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('✅ Eye Care API is running');
});

router.post('/create', eyeRoutineReminderController.saveReminder);
router.post('/get', eyeRoutineReminderController.getReminder);
router.delete('/delete/:id', eyeRoutineReminderController.deleteReminder);
router.post('/updateStatus', eyeRoutineReminderController.updateCompleteStatus);

module.exports = router;