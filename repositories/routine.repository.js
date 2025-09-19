const RoutineEntry = require('../models/RoutineEntry');
const RoutineGoal = require('../models/RoutineGoal');

class RoutineRepository {
  async createOrUpdateEntry(email, date, routine, completed) {
    let entry = await RoutineEntry.findOne({ email, date, routine });
    if (entry) {
      entry.completed = completed;
      return await entry.save();
    }
    return await RoutineEntry.create({ email, date, routine, completed });
  }

  async getEntry(email, date, routine) {
    return await RoutineEntry.findOne({ email, date, routine });
  }

  async getDailyStatus(email, date) {
    return await RoutineEntry.find({ email, date });
  }

  async getCounts(email, date, routines) {
    return await Promise.all(
      routines.map(routine => 
        RoutineEntry.countDocuments({ email, date, routine })
      )
    );
  }

  async getGoals(email) {
    return await RoutineGoal.find({ email });
  }

  async createDefaultGoals(email, routines) {
    const defaultGoals = routines.map(routine => ({
      email,
      routine,
      targetPerDay: this.getDefaultTarget(routine),
      type: 'ogon'
    }));
    await RoutineGoal.insertMany(defaultGoals);
    return defaultGoals;
  }

  getDefaultTarget(routine) {
    const defaults = {
      'blinkträning': 3,
      'dropptimer': 3,
      '202020timer': 2,
      'varmkompress': 1,
      'ögonrengöring': 1,
      'skrattövning': 1
    };
    return defaults[routine] || 1;
  }
}

module.exports = new RoutineRepository();