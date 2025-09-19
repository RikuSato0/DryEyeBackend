const EyeRoutineReminder = require("../models/EyeRoutineReminder");
const {Types} = require("mongoose");
const EyeRoutineReminderCompletion = require("../models/EyeRoutineReminderCompletion");

class EyeRoutineReminderCompletionRepository {
    async insertMany(postData) {
        return await EyeRoutineReminderCompletion.insertMany(postData);
    }

    async findOne(userId, today, type) {
        return await EyeRoutineReminderCompletion.findOne({
            userId,
            date: today,
            type
        });
    }

    async deleteMany(reminderId, userId) {
        await EyeRoutineReminderCompletion.deleteMany({
            reminderId: new Types.ObjectId(reminderId),
            userId: new Types.ObjectId(userId)
        });
    }

    async updateMany(userId, type, currentDate, isComplete) {
        await EyeRoutineReminderCompletion.updateMany(
            {
                userId,
                type,
                date: currentDate
            },
            {$set: {isCompleted: isComplete}}
        );
    }
}

module.exports = new EyeRoutineReminderCompletionRepository();