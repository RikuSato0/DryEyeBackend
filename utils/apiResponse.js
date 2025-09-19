class ApiResponse {
  static success(res, statusCode, message, data = null) {
    const response = {
      success: true,
      message
    };
    if (data) response.data = data;
    res.status(statusCode).json(response);
  }

  static error(res, statusCode, message) {
    res.status(statusCode).json({
      success: false,
      message
    });
  }
}

module.exports = ApiResponse;