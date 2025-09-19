const mongoose = require('mongoose');

const EyeRoutineReminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: [
            'BASIC_BLINK',
            'ADVANCED_BLINK',
            'DROP_TIMER',
            'WARM_COMPRESS',
            'EYE_LID_CLEANING',
            'HOME_WORKOUT',
            'ADVANCED_TRAINING',
            'OMEGA_3'
        ],
        required: true
    },
    timezone: { type: String, required: true },
    repeatReminder: {
        type: [Number], // 1-7 for weekdays, 8 for everyday
        required: true
    },
    time: {
        type: String, // 24-hour format (HH:mm)
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    title: { type: String, default: '' },
    instructions: { type: String, default: '' },
    selectedEye: { type: String, enum: ['left','right','both', null], default: null },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('EyeRoutineReminder', EyeRoutineReminderSchema, 'eye_routine_reminder');
