require("dotenv").config();
const winston = require("winston");

const env = process.env;
const NODE_ENV = env.NODE_ENV;

const levels = {
  error: 0, // fatal error
  warn: 1, // warning
  info: 2, // general information
  http: 3, // http request information
  debug: 4 // for devs to debug
};

const level = () => {
  const env = NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn"; // In dev, log more (debug), in prod, log less (warn and above)
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white"
});

const consoleLogFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.splat(),
  winston.format.printf(
    (info) => `\n### [${info.timestamp}] - ${info.level}: ${info.message}`
  )
);

// const fileLogFormat = winston.format.combine(
//   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
//   winston.format.json()
// );

const transports = [
  new winston.transports.Console({
    format: consoleLogFormat,
    level: level()
  })
  // new winston.transports.File({
  //   filename: "../backend/logs/combined.log",
  //   level: level(),
  //   format: fileLogFormat
  // })
];

const logger = winston.createLogger({
  levels: levels,
  level: level(),
  transports: transports
});

module.exports = logger;
