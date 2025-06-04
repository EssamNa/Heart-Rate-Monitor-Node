var appRoot = require('app-root-path');
const winston = require("winston");

const level = process.env.LOG_LEVEL || 'verbose';

var options = {
  file: {
    level: 'verbose',
    name: 'file.info',
    filename: `${appRoot}/logs/server.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    timestamp: true
  },
  errorFile: {
    level: 'error',
    name: 'file.error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    timestamp: true
  },
  console: {
    level: level,
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true
  },
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
    transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.errorFile),
    new (winston.transports.File)(options.file)
    ]
});

module.exports = logger
