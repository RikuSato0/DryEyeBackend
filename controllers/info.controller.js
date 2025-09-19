const ApiResponse = require('../utils/apiResponse');
const infoService = require('../services/info.service');

class InfoController {
  async getInfoBySlug(req, res, next) {
    try {
      const info = await infoService.getInfoBySlug(req.params.slug);
      ApiResponse.success(res, 200, 'Information retrieved', {
        content: info.content
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InfoController();