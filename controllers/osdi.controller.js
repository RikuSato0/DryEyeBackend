const ApiResponse = require('../utils/apiResponse');
const osdiService = require('../services/osdi.service');
const { diagnoseDryEye } = require('../utils/diagnoseDryEyeCalculator');
const {successResponse, errorResponse} = require("../utils/responseHandler");

class OSDIController {
  async demodexRiskCheckGenerateResult(req, res, next) {
    try {
      const { Q1, Q2, Q3, Q4, Q5, Q6, Q7 } = req.body;

      // Put all questions into an array
      const questions = [Q1, Q2, Q3, Q4, Q5, Q6, Q7];

      // Count how many are true
      const result = questions.filter(q => q === true).length;

      return successResponse(res, result, 'Demodex Risk check result saved', 301, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async diagnoseDryEyeGenerateResult(req, res, next) {
    try {
      const { Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20 } = req.body;
      const answers = {
        Q1, Q2, Q3, Q4, Q5, Q6, Q7,
        Q8, Q9, Q10, Q11, Q12, Q13, Q14,
        Q15, Q16, Q17, Q18, Q19, Q20
      };
      const result = diagnoseDryEye(answers);
      return successResponse(res, result, 'Diagnose Dry Eye result saved', 301, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }
  async OSDIGenerateResult(req, res, next) {
    try {
      const { Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12 } = req.body;
      const answers = [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12]; // 12 answers with one N/A
      const result = 'osdi result';
      return successResponse(res, result, 'OSDI result saved', 301, 200);

    } catch (err) {
      return errorResponse(res, err.message, 400, err.messageCode);
    }
  }

  async saveResult(req, res, next) {
    try {
      const { email, score, severity } = req.body;
      await osdiService.saveResult(email, score, severity);
      ApiResponse.success(res, 201, 'OSDI result saved');
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const results = await osdiService.getHistory(req.params.email);
      ApiResponse.success(res, 200, 'OSDI history retrieved', results);
    } catch (err) {
      next(err);
    }
  }

  async deleteResult(req, res, next) {
    try {
      const { email, id } = req.params;
      await osdiService.deleteResult(email, id);
      ApiResponse.success(res, 200, 'OSDI test deleted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OSDIController();