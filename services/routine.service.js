const ApiError = require('../utils/apiError');
const routineRepository = require('../repositories/routine.repository');
const { EYE_ROUTINES } = require('../config/constants');

class RoutineService {
  async updateRoutineStatus(email, routine, completed) {
    const date = new Date().toISOString().split('T')[0];
    return await routineRepository.createOrUpdateEntry(
      email, 
      date, 
      routine, 
      completed
    );
  }

  async getRoutineStatus(email, routine) {
    const date = new Date().toISOString().split('T')[0];
    const entry = await routineRepository.getEntry(email, date, routine);
    return { completed: entry?.completed ?? false };
  }

  async getDailyStatus(email) {
    const date = new Date().toISOString().split('T')[0];
    const entries = await routineRepository.getDailyStatus(email, date);
    
    const result = {};
    EYE_ROUTINES.forEach(routine => {
      const match = entries.find(e => e.routine === routine);
      result[routine] = match?.completed ?? false;
    });
    
    return result;
  }

  async getExtendedStatus(email) {
    const date = new Date().toISOString().split('T')[0];
    
    // Get or create goals
    let goals = await routineRepository.getGoals(email);
    if (goals.length === 0) {
      goals = await routineRepository.createDefaultGoals(email, EYE_ROUTINES);
    }

    // Create goal map
    const goalMap = {};
    goals.forEach(g => { goalMap[g.routine] = g.targetPerDay; });

    // Get completion counts
    const counts = await routineRepository.getCounts(email, date, EYE_ROUTINES);
    
    // Build result
    const result = {};
    EYE_ROUTINES.forEach((routine, i) => {
      result[routine] = {
        done: counts[i],
        goal: goalMap[routine] ?? 0
      };
    });

    return result;
  }
}

module.exports = new RoutineService();