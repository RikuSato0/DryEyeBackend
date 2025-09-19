const mongoose = require('mongoose');

const EyeRoutineReminderCompletionSchema = new mongoose.Schema({
    reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'EyeRoutineReminder', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    date: { type: String, required: true }, // "YYYY-MM-DD" → the scheduled day
    time: { type: String, required: true }, // "HH:mm" → matches reminder.time

    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('EyeRoutineReminderCompletion', EyeRoutineReminderCompletionSchema, 'eye_routine_reminder_completion');
