import winston from 'winston'
import expressWinston from 'express-winston'
import fs from 'fs'

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'todo-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
})

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Security event logger
export const securityLogger = {
  logFailedLogin: (email, ip, userAgent) => {
    logger.warn('Failed login attempt', {
      event: 'FAILED_LOGIN',
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    })
  },
  
  logAccountLocked: (email, ip) => {
    logger.warn('Account locked due to multiple failed attempts', {
      event: 'ACCOUNT_LOCKED',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  logSuccessfulLogin: (email, ip) => {
    logger.info('Successful login', {
      event: 'SUCCESSFUL_LOGIN',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  logPasswordReset: (email, ip) => {
    logger.info('Password reset requested', {
      event: 'PASSWORD_RESET_REQUEST',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  logSuspiciousActivity: (event, details, ip) => {
    logger.warn('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      activity: event,
      details,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  logRateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    })
  }
}

// Express request logger
export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false
  },
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  responseWhitelist: ['statusCode'],
  dynamicMeta: (req, res) => {
    return {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    }
  }
})

// Express error logger
export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'Error {{err.message}}',
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  dynamicMeta: (req, res, err) => {
    return {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      stack: err.stack
    }
  }
})

export default logger