const eyeRoutineReminderService = require('../repositories/eyeroutinereminder.repository');
const {errorResponse, successResponse} = require("../utils/responseHandler");
const eyeRoutineReminderCompletionService = require('../repositories/eyeRoutineReminderCompletion.repository');
const moment = require('moment'); // or use dayjs if you prefer

const {Types} = require("mongoose");
const ApiError = require("../utils/apiError");

class EyeRoutineReminderController {
    async saveReminder(req, res, next) {
        try {
            const {repeatReminder, time, instructions, type, startDate, endDate} = req.body;
            const userId = new Types.ObjectId(req.user.userId);

            // 1️⃣ Save master reminder
            const reminder = await eyeRoutineReminderService.saveRoutineReminder({
                userId,
                repeatReminder,
                time,
                instructions,
                type,
                startDate,
                endDate
            });

            // 2️⃣ Generate completion entries for each valid date
            const completions = [];
            let current = new Date(startDate);
            const end = new Date(endDate);

            while (current <= end) {
                const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay(); // Sunday=0 -> 7

                // Check if today matches repeatReminder (or everyday=8)
                if (repeatReminder.includes(dayOfWeek) || repeatReminder.includes(8)) {
                    completions.push({
                        reminderId: reminder._id,
                        userId,
                        type,
                        date: current.toISOString().split('T')[0], // YYYY-MM-DD
                        time,
                        isCompleted: false
                    });
                }

                current.setDate(current.getDate() + 1); // move to next day
            }

            if (completions.length > 0) {
                await eyeRoutineReminderCompletionService.insertMany(completions);
            }

            return successResponse(res, reminder, 'Eye Routine Reminder added successfully', 203, 200);
        } catch (err) {
            console.error('Error saving reminder:', err);
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async getReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const {type} = req.body;
            // 1. Fetch all reminders for this user
            const reminders = await eyeRoutineReminderService.getReminder(userId, type);
            const formattedReminders = reminders.map(r => ({
                ...r.toObject(),
                startDate: moment(r.startDate).format("YYYY-MM-DD"),
                endDate: moment(r.endDate).format("YYYY-MM-DD")
            }));

            // 2. Fetch completion records for today (or all, depending on your need)
            // check if today’s reminder is completed
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const completion = await eyeRoutineReminderCompletionService.findOne(userId, today, type);

            const isComplete = !!completion?.isCompleted;

            return successResponse(res, {
                reminders: formattedReminders,
                isComplete
            }, 'Eye Routine Reminder fetch successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async deleteReminder(req, res, next) {
        try {
            const userId = req.user.userId;
            const reminderId = req.params.id;

            await eyeRoutineReminderService.deleteReminder(userId, reminderId);
            await eyeRoutineReminderCompletionService.deleteMany(reminderId, userId);
            return successResponse(res, {}, 'Eye Routine Reminder deleted successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }

    async updateCompleteStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const {type, isComplete} = req.body;

            // Find all reminders of this type for user
            const reminders = await eyeRoutineReminderService.getReminder(userId, type);
            if (!reminders || reminders.length === 0) {
                throw new ApiError(404, 'No reminders found for this type', 701);
            }
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const response = await eyeRoutineReminderCompletionService.updateMany(userId, type, today, isComplete);
            return successResponse(res, response, 'Eye Routine Reminder updated successfully', 203, 200);
        } catch (err) {
            return errorResponse(res, err.message, 400, err.messageCode);
        }
    }
}

module.exports = new EyeRoutineReminderController();