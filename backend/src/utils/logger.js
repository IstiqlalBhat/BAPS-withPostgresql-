const winston = require('winston');
const path = require('path');

const logDir = 'logs';
const logLevel = process.env.LOG_LEVEL || 'info';

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bbaps-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
      })
    )
  }));
}

module.exports = logger;
