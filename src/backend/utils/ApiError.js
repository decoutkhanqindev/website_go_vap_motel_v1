class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

// https://github.com/trungquandev/trungquandev-public-utilities-algorithms/blob/main/12-node-expressjs-handling-errors/ApiError.js
