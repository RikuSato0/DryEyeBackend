const EyeRoutineReminder = require("../models/EyeRoutineReminder");
const {Types} = require("mongoose");
const EyeRoutineReminderCompletion = require("../models/EyeRoutineReminderCompletion");

class EyeRoutineReminderCompletionRepository {
    async insertMany(postData) {
        return await EyeRoutineReminderCompletion.insertMany(postData);
    }

    async findOne(userId, occurrenceDate, type, scheduledTime) {
        const filter = { userId, occurrenceDate, type };
        if (scheduledTime) filter.scheduledTime = scheduledTime;
        return await EyeRoutineReminderCompletion.findOne(filter);
    }

    async deleteMany(reminderId, userId) {
        await EyeRoutineReminderCompletion.deleteMany({
            reminderId: new Types.ObjectId(reminderId),
            userId: new Types.ObjectId(userId)
        });
    }

    async upsertOccurrence(reminderId, userId, type, occurrenceDate, scheduledTime, status) {
        return await EyeRoutineReminderCompletion.updateOne(
          { reminderId, userId, type, occurrenceDate, scheduledTime },
          { $set: { status, recordedAt: new Date() } },
          { upsert: true }
        );
    }

  async ensureMissedIfAbsent(reminderId, userId, type, occurrenceDate, scheduledTime) {
    // Do not overwrite existing statuses; only create if absent
    return await EyeRoutineReminderCompletion.updateOne(
      { reminderId, userId, type, occurrenceDate, scheduledTime },
      { $setOnInsert: { status: 'MISSED', recordedAt: new Date() } },
      { upsert: true }
    );
  }

  async findByUserTypeRange(userId, type, from, to) {
    const filter = { userId };
    if (type) filter.type = type;
    if (from || to) {
      filter.occurrenceDate = {};
      if (from) filter.occurrenceDate.$gte = from;
      if (to) filter.occurrenceDate.$lte = to;
    }
    return await EyeRoutineReminderCompletion.find(filter).sort({ occurrenceDate: -1, scheduledTime: 1 });
  }
}

module.exports = new EyeRoutineReminderCompletionRepository();