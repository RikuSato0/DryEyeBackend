const EyeRoutineReminder = require('../models/EyeRoutineReminder');
const BlinkResult = require("../models/BlinkResult");
const {Types} = require("mongoose");

class EyeRoutineReminderRepository {
    async saveRoutineReminder(postData) {
        return await EyeRoutineReminder.create(postData);
    }

    async getReminder(userId, type) {
        return await EyeRoutineReminder.find({ userId, type }).sort({ date: -1 });
    }

    async deleteReminder(userId, id) {
        return await EyeRoutineReminder.findOneAndDelete({
            _id: id,
            userId: new Types.ObjectId(userId)
        });
    }

    async updateCompleteStatus(userId, id, status) {
        return await EyeRoutineReminder.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            },
            {
                $set: { isComplete: status }
            },
            { new: true } // return updated document
        );
    }
}

module.exports = new EyeRoutineReminderRepository();