const RoutineGoal = require('../models/RoutineGoal');
const RoutineEntry = require('../models/RoutineEntry');
const RoutineProgress = require('../models/RoutineProgress');
const WeeklyGoal = require('../models/WeeklyGoal');
const TrainingLog = require('../models/TrainingLog');

class TrainingRepository {
  // Training Goals
  async resetTrainingGoals(email) {
    await RoutineGoal.deleteMany({ email, type: 'training' });
    const routines = ['hemmapass', 'promenad', 'styrketraning', 'stretch', 'kostschema'];
    const defaultGoals = routines.map(routine => ({
      email,
      routine,
      type: 'training',
      targetPerWeek: 1
    }));
    return await RoutineGoal.insertMany(defaultGoals);
  }

  async saveTrainingGoals(goals) {
    const bulkOps = goals.map(goal => ({
      updateOne: {
        filter: { email: goal.email, routine: goal.routine, type: 'training' },
        update: { $set: { targetPerWeek: goal.targetPerWeek } },
        upsert: true
      }
    }));
    return await RoutineGoal.bulkWrite(bulkOps);
  }

  async getTrainingGoals(email) {
    return await RoutineGoal.find({ email });
  }

  // Routine Entries
  async createTrainingEntry(data) {
    return await RoutineEntry.create(data);
  }

  async deleteTrainingEntry(email, routine, date) {
    return await RoutineEntry.deleteOne({ email, routine, type: 'training', date });
  }

  async countWeeklyCompletions(email, routine, startDate, endDate) {
    return await RoutineEntry.countDocuments({
      email,
      routine,
      type: 'training',
      date: { $gte: startDate, $lte: endDate }
    });
  }

  // Training Log
  async updateTrainingLog(email, date, routine, completed) {
    const update = { [`routines.${routine}`]: completed };
    return await TrainingLog.findOneAndUpdate(
      { email, date },
      { $set: update },
      { new: true, upsert: true }
    );
  }

  async getTrainingLog(email, date) {
    return await TrainingLog.findOne({ email, date });
  }

  // Weekly Goals
  async updateWeeklyGoal(email, trainingDays, eyeRoutineDays) {
    return await WeeklyGoal.findOneAndUpdate(
      { email },
      { trainingDays, eyeRoutineDays },
      { new: true, upsert: true }
    );
  }

  async getWeeklyGoal(email) {
    return await WeeklyGoal.findOne({ email });
  }

  // Progress Tracking
  async incrementProgress(email, routine, date) {
    return await RoutineProgress.findOneAndUpdate(
      { email, routine, date },
      { $inc: { completedCount: 1 } },
      { new: true, upsert: true }
    );
  }

  async decrementProgress(email, routine, date) {
    const progress = await RoutineProgress.findOne({ email, routine, date });
    if (!progress || progress.completedCount <= 0) return null;
    
    progress.completedCount -= 1;
    await progress.save();
    return progress;
  }

  async getProgressStatus(email, date) {
    return await RoutineProgress.find({ email, date });
  }
}

module.exports = new TrainingRepository();