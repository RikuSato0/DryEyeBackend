const ApiResponse = require('../utils/apiResponse');
const routineService = require('../services/routine.service');

class RoutineController {
  async updateStatus(req, res, next) {
    try {
      const { email, completed } = req.body;
      const routine = req.params.routine;
      await routineService.updateRoutineStatus(email, routine, completed);
      ApiResponse.success(res, 200, 'Routine status updated');
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { email } = req.query;
      const routine = req.params.routine;
      const status = await routineService.getRoutineStatus(email, routine);
      ApiResponse.success(res, 200, 'Routine status retrieved', status);
    } catch (err) {
      next(err);
    }
  }

  async getDailyStatus(req, res, next) {
    try {
      const { email } = req.params;
      const status = await routineService.getDailyStatus(email);
      ApiResponse.success(res, 200, 'Daily status retrieved', status);
    } catch (err) {
      next(err);
    }
  }

  async getExtendedStatus(req, res, next) {
    try {
      const { email } = req.params;
      const status = await routineService.getExtendedStatus(email);
      ApiResponse.success(res, 200, 'Extended status retrieved', status);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RoutineController();