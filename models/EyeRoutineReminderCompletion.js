const mongoose = require('mongoose');

const EyeRoutineReminderCompletionSchema = new mongoose.Schema({
    reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'EyeRoutineReminder', required: true },
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
    occurrenceDate: { type: String, required: true }, // YYYY-MM-DD in reminder.tz
    scheduledTime: { type: String, required: true }, // HH:mm
    status: { type: String, enum: ['COMPLETED','SKIPPED','MISSED'], default: 'MISSED' },
    recordedAt: { type: Date }
}, { timestamps: true });

EyeRoutineReminderCompletionSchema.index({ reminderId: 1, occurrenceDate: 1, scheduledTime: 1 }, { unique: true });
EyeRoutineReminderCompletionSchema.index({ userId: 1, occurrenceDate: 1 });
EyeRoutineReminderCompletionSchema.index({ status: 1, occurrenceDate: 1 });

module.exports = mongoose.model('EyeRoutineReminderCompletion', EyeRoutineReminderCompletionSchema, 'eye_routine_reminder_completion');
