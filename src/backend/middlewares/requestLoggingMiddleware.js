const logger = require("../utils/logger");

const requestLoggingMiddleware = (req, res, next) => {
  const { method, originalUrl, headers, query, body, ip } = req;
  const message = {
    method: method,
    url: originalUrl,
    query: query,
    body: Object.keys(body).length ? body : "No body",
    ip: ip,
    headers: headers
  };

  logger.http(message);
  next();
};

module.exports = requestLoggingMiddleware;
