const express = require('express');
const eyeRoutineReminderController = require("../controllers/eyeRoutineReminder.controller");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('✅ Eye Care API is running');
});

router.post('/createReminder', eyeRoutineReminderController.saveReminder);
router.post('/getReminder', eyeRoutineReminderController.getReminder);
router.delete('/deleteReminder/:id', eyeRoutineReminderController.deleteReminder);
router.post('/updateReminderStatus', eyeRoutineReminderController.updateCompleteStatus);

module.exports = router;