const ApiError = require('../utils/apiError');
const trainingRepository = require('../repositories/training.repository');

class TrainingService {
  // Training Goals
  async resetTrainingGoals(email) {
    return await trainingRepository.resetTrainingGoals(email);
  }

  async saveTrainingGoals(goals) {
    if (!Array.isArray(goals)) {
      throw new ApiError(400, 'Invalid goals data');
    }
    return await trainingRepository.saveTrainingGoals(goals);
  }

  async getTrainingGoals(email) {
    return await trainingRepository.getTrainingGoals(email);
  }

  // Training Status
  async getExtendedStatus(email, date = new Date()) {
    // Calculate week range (Monday to Sunday)
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const goals = await trainingRepository.getTrainingGoals(email);
    const goalMap = {};
    goals.forEach(g => { goalMap[g.routine] = g.targetPerWeek ?? 0; });

    const routines = ['hemmapass', 'promenad', 'styrketraning'];
    const counts = await Promise.all(
      routines.map(routine => 
        trainingRepository.countWeeklyCompletions(email, routine, monday, sunday)
      )
    );

    const result = {};
    routines.forEach((r, i) => {
      result[r] = {
        done: counts[i],
        goal: goalMap[r] ?? 0
      };
    });

    return result;
  }

  // Routine Entries
  async createTrainingEntry(email, routine, date) {
    if (!email || !routine) {
      throw new ApiError(400, 'Email and routine are required');
    }
    return await trainingRepository.createTrainingEntry({
      email,
      routine,
      date: date || new Date().toISOString().substring(0, 10),
      type: 'training'
    });
  }

  async deleteTrainingEntry(email, routine, date) {
    if (!email || !routine || !date) {
      throw new ApiError(400, 'Email, routine and date are required');
    }
    return await trainingRepository.deleteTrainingEntry(email, routine, date);
  }

  // Training Log
  async updateTrainingStatus(email, date, routine, completed) {
    if (!email || !routine) {
      throw new ApiError(400, 'Email and routine are required');
    }
    return await trainingRepository.updateTrainingLog(
      email,
      date || new Date().toISOString().split('T')[0],
      routine,
      completed
    );
  }

  async getTrainingStatus(email, date) {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    return await trainingRepository.getTrainingLog(
      email,
      date || new Date().toISOString().split('T')[0]
    );
  }

  // Weekly Goals
  async updateWeeklyGoal(email, trainingDays, eyeRoutineDays) {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    return await trainingRepository.updateWeeklyGoal(email, trainingDays, eyeRoutineDays);
  }

  async getWeeklyGoal(email) {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    return await trainingRepository.getWeeklyGoal(email);
  }

  // Progress Tracking
  async incrementProgress(email, routine) {
    const date = new Date().toISOString().split('T')[0];
    return await trainingRepository.incrementProgress(email, routine, date);
  }

  async decrementProgress(email, routine) {
    const date = new Date().toISOString().split('T')[0];
    const result = await trainingRepository.decrementProgress(email, routine, date);
    if (!result) {
      throw new ApiError(400, 'Nothing to undo');
    }
    return result;
  }

  async getProgressStatus(email, date) {
    const [goals, progress] = await Promise.all([
      this.getTrainingGoals(email),
      trainingRepository.getProgressStatus(email, date || new Date().toISOString().split('T')[0])
    ]);

    return goals.map(goal => {
      const match = progress.find(p => p.routine === goal.routine);
      return {
        routine: goal.routine,
        targetPerDay: goal.targetPerDay,
        completedCount: match?.completedCount || 0
      };
    });
  }
}

module.exports = new TrainingService();