const mongoose = require('mongoose');

const EyeRoutineReminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repeatReminder: {
        type: [Number], // 1-7 for weekdays, 8 for everyday
        required: true
    },
    time: {
        type: String, // 24-hour format (HH:mm)
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Validates HH:mm format
    },
    instructions: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: [
            'BLINK_TRAINING',
            'EYE_DROP_TIMER',
            '20_20_20_TIMER',
            'WARM_COMPRESS',
            'EYE_CLEANING',
            'LAUGH_EXERCISE'
        ],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
}, {
    timestamps: true // Adds createdAt & updatedAt fields
});

module.exports = mongoose.model('EyeRoutineReminder', EyeRoutineReminderSchema, 'eye_routine_reminder');
