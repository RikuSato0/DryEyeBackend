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

  async findOneByReminder(reminderId, occurrenceDate, scheduledTime) {
    return await EyeRoutineReminderCompletion.findOne({ reminderId, occurrenceDate, scheduledTime });
  }

  async findAnyByReminderDate(reminderId, occurrenceDate) {
    return await EyeRoutineReminderCompletion.findOne({ reminderId, occurrenceDate }).sort({ recordedAt: -1 });
  }

    async deleteMany(reminderId, userId) {
        await EyeRoutineReminderCompletion.deleteMany({
            reminderId: new Types.ObjectId(reminderId),
            userId: new Types.ObjectId(userId)
        });
    }

    async upsertOccurrence(reminderId, userId, type, occurrenceDate, scheduledTime, status) {
        try {
            return await EyeRoutineReminderCompletion.updateOne(
              { reminderId, userId, type, occurrenceDate, scheduledTime },
              { $set: { status, recordedAt: new Date() } },
              { upsert: true }
            );
        } catch (err) {
            if (err && (err.code === 11000 || (err.message && err.message.includes('E11000')))) {
                // Ignore duplicate key race condition: another request inserted the same occurrence
                return { acknowledged: true };
            }
            throw err;
        }
    }

  async ensureMissedIfAbsent(reminderId, userId, type, occurrenceDate, scheduledTime) {
    // Do not overwrite existing statuses; only create if absent
    try {
      return await EyeRoutineReminderCompletion.updateOne(
        { reminderId, userId, type, occurrenceDate, scheduledTime },
        { $setOnInsert: { status: 'MISSED', recordedAt: new Date() } },
        { upsert: true }
      );
    } catch (err) {
      if (err && (err.code === 11000 || (err.message && err.message.includes('E11000')))) {
        // Another concurrent request inserted the same document; safe to ignore
        return { acknowledged: true };
      }
      throw err;
    }
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