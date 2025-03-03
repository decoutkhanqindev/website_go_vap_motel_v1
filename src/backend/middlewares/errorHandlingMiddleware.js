const StatusCodes = require("http-status-codes");

const errorHandlingMiddleware = (err, req, res, next) => {
  // if not modify status code, default is 500
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  };
  res.status(responseError.statusCode).json(responseError);
};

module.exports = errorHandlingMiddleware;

// https://github.com/trungquandev/trungquandev-public-utilities-algorithms/blob/main/12-node-expressjs-handling-errors/errorHandlingMiddleware.js
