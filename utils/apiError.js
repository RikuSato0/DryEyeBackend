class ApiError extends Error {
  constructor(statusCode, message, messageCode = 201) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.messageCode = messageCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;