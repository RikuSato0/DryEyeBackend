const EyeRoutineReminder = require('../models/EyeRoutineReminder');
const BlinkResult = require("../models/BlinkResult");
const {Types} = require("mongoose");

class EyeRoutineReminderRepository {
    async saveRoutineReminder(postData) {
        return await EyeRoutineReminder.create(postData);
    }

    async getReminders(userId, type) {
        const filter = { userId };
        if (type) filter.type = type;
        return await EyeRoutineReminder.find(filter).sort({ createdAt: -1 });
    }

    async deleteReminder(userId, id) {
        return await EyeRoutineReminder.findOneAndDelete({
            _id: id,
            userId: new Types.ObjectId(userId)
        });
    }

    async updateReminder(userId, id, update) {
        return await EyeRoutineReminder.findOneAndUpdate({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }, update, { new: true });
    }
}

module.exports = new EyeRoutineReminderRepository();