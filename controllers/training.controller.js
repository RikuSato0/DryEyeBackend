const ApiResponse = require('../utils/apiResponse');
const trainingService = require('../services/training.service');

class TrainingController {
  // Training Goals
  async resetTrainingGoals(req, res, next) {
    try {
      const goals = await trainingService.resetTrainingGoals(req.params.email);
      ApiResponse.success(res, 200, 'Training goals reset', goals);
    } catch (err) {
      next(err);
    }
  }

  async saveTrainingGoals(req, res, next) {
    try {
      await trainingService.saveTrainingGoals(req.body);
      ApiResponse.success(res, 200, 'Training goals saved');
    } catch (err) {
      next(err);
    }
  }

  async getTrainingGoals(req, res, next) {
    try {
      const goals = await trainingService.getTrainingGoals(req.query.email);
      ApiResponse.success(res, 200, 'Training goals retrieved', goals);
    } catch (err) {
      next(err);
    }
  }

  // Training Status
  async getExtendedStatus(req, res, next) {
    try {
      const status = await trainingService.getExtendedStatus(
        req.params.email,
        req.query.date ? new Date(req.query.date) : new Date()
      );
      ApiResponse.success(res, 200, 'Extended training status retrieved', status);
    } catch (err) {
      next(err);
    }
  }

  // Routine Entries
  async createTrainingEntry(req, res, next) {
    try {
      await trainingService.createTrainingEntry(
        req.body.email,
        req.body.routine,
        req.body.date
      );
      ApiResponse.success(res, 201, 'Training entry created');
    } catch (err) {
      next(err);
    }
  }

  async deleteTrainingEntry(req, res, next) {
    try {
      await trainingService.deleteTrainingEntry(
        req.body.email,
        req.body.routine,
        req.body.date
      );
      ApiResponse.success(res, 200, 'Training entry deleted');
    } catch (err) {
      next(err);
    }
  }

  // Training Log
  async updateTrainingStatus(req, res, next) {
    try {
      await trainingService.updateTrainingStatus(
        req.body.email,
        req.body.date,
        req.body.routine,
        req.body.completed
      );
      ApiResponse.success(res, 200, 'Training status updated');
    } catch (err) {
      next(err);
    }
  }

  async getTrainingStatus(req, res, next) {
    try {
      const status = await trainingService.getTrainingStatus(
        req.query.email,
        req.query.date
      );
      ApiResponse.success(res, 200, 'Training status retrieved', status || {});
    } catch (err) {
      next(err);
    }
  }

  // Weekly Goals
  async updateWeeklyGoal(req, res, next) {
    try {
      const result = await trainingService.updateWeeklyGoal(
        req.body.email,
        req.body.trainingDays,
        req.body.eyeRoutineDays
      );
      ApiResponse.success(res, 200, 'Weekly goal updated', result);
    } catch (err) {
      next(err);
    }
  }

  async getWeeklyGoal(req, res, next) {
    try {
      const result = await trainingService.getWeeklyGoal(req.query.email);
      if (!result) {
        throw new ApiError(404, 'Weekly goal not found');
      }
      ApiResponse.success(res, 200, 'Weekly goal retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  // Progress Tracking
  async incrementProgress(req, res, next) {
    try {
      const result = await trainingService.incrementProgress(
        req.body.email,
        req.body.routine
      );
      ApiResponse.success(res, 200, 'Progress incremented', result);
    } catch (err) {
      next(err);
    }
  }

  async decrementProgress(req, res, next) {
    try {
      const result = await trainingService.decrementProgress(
        req.body.email,
        req.body.routine
      );
      ApiResponse.success(res, 200, 'Progress decremented', result);
    } catch (err) {
      next(err);
    }
  }

  async getProgressStatus(req, res, next) {
    try {
      const status = await trainingService.getProgressStatus(
        req.query.email,
        req.query.date
      );
      ApiResponse.success(res, 200, 'Progress status retrieved', status);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TrainingController();