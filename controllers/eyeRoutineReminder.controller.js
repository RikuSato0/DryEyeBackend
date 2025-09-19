const eyeRoutineReminderRepo = require('../repositories/eyeroutinereminder.repository');
const {errorResponse, successResponse} = require("../utils/responseHandler");
const completionRepo = require('../repositories/eyeRoutineReminderCompletion.repository');
const moment = require('moment-timezone');

const {Types} = require("mongoose");
const ApiError = require("../utils/apiError");

class EyeRoutineReminderController {
    async saveReminder(req, res, next) {
        try {
            const {repeatReminder, time, instructions, type, startDate, endDate, timezone, title, selectedEye, isActive} = req.body;
            const userId = new Types.ObjectId(req.user.userId);
            const reminder = await eyeRoutineReminderRepo.saveRoutineReminder({ userId, repeatReminder, time, instructions, type, startDate, endDate, timezone, title, selectedEye, isActive });

            return successResponse(res, reminder, 'Eye Routine Reminder added successfully', 203, 200);
        } catch (err) {
            console.error('Error saving reminder:', err);
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async getReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const {type, period} = req.body;
            const reminders = await eyeRoutineReminderRepo.getReminders(userId, type);

            // Lazy MISSED marking: yesterday and today's past times for this user/type
            for (const r of reminders) {
                if (type && r.type !== type) continue; // only requested type
                const tz = r.timezone;
                const nowTz = moment.tz(tz);
                const today = nowTz.format('YYYY-MM-DD');
                const yesterday = nowTz.clone().subtract(1, 'day').format('YYYY-MM-DD');

                // Bounds check with reminder start/end date in its timezone
                const startStr = moment.tz(r.startDate, tz).format('YYYY-MM-DD');
                const endStr = r.endDate ? moment.tz(r.endDate, tz).format('YYYY-MM-DD') : null;
                const inRange = (d) => (d >= startStr) && (!endStr || d <= endStr);

                // Yesterday missed
                const yDow = parseInt(nowTz.clone().subtract(1, 'day').format('E')); // 1..7
                const yMatches = (r.repeatReminder.includes(8) || r.repeatReminder.includes(yDow)) && inRange(yesterday);
                if (yMatches) {
                    await completionRepo.ensureMissedIfAbsent(r._id, r.userId, r.type, yesterday, r.time);
                }

                // Today missed if scheduled time already passed
                const tDow = parseInt(nowTz.format('E'));
                const tMatches = (r.repeatReminder.includes(8) || r.repeatReminder.includes(tDow)) && inRange(today);
                const nowTime = nowTz.format('HH:mm');
                if (tMatches && r.time < nowTime) {
                    await completionRepo.ensureMissedIfAbsent(r._id, r.userId, r.type, today, r.time);
                }
            }

            const data = reminders.map(r => ({
                ...r.toObject(),
                startDate: moment(r.startDate).format('YYYY-MM-DD'),
                endDate: r.endDate ? moment(r.endDate).format('YYYY-MM-DD') : null
            }));

            return successResponse(res, { reminders: data }, 'Eye Routine Reminder fetch successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async deleteReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const reminderId = req.params.id;

            await eyeRoutineReminderRepo.deleteReminder(userId, reminderId);
            await completionRepo.deleteMany(reminderId, userId);
            return successResponse(res, {}, 'Eye Routine Reminder deleted successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async updateCompleteStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const { id, occurrenceDate, scheduledTime, status } = req.body;
            if (!id || !occurrenceDate || !scheduledTime || !status) throw new ApiError(400, 'id, occurrenceDate, scheduledTime, status are required', 701);
            await completionRepo.upsertOccurrence(new Types.ObjectId(id), new Types.ObjectId(userId), undefined, occurrenceDate, scheduledTime, status);
            return successResponse(res, {}, 'Eye Routine Reminder updated successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }
}

module.exports = new EyeRoutineReminderController();