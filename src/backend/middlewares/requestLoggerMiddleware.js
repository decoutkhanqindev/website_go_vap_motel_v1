const logger = require("../utils/logger");

const requestLoggerMiddleware = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const message = `${method} ${url}`;
  // if (method === "POST" || method === "PUT") {
  //   mess    
  // }
  logger.http(message);
  next();
};

module.exports = requestLoggerMiddleware;
