import { body, param, validationResult } from 'express-validator'
import logger, { securityLogger } from './logger.js'

// Common validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/

export const validateSignup = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
]

export const validateSignin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
]

export const validateTodo = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters'),
  body('completed')
    .optional()
    .custom((value) => {
      if (value === true || value === false || value === 1 || value === 0) {
        return true;
      }
      throw new Error('Completed must be boolean');
    }),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be valid ISO 8601 format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category max 50 characters'),
  body('type')
    .optional()
    .isIn(['task', 'meeting', 'reminder', 'project', 'personal', 'work', 'shopping', 'health'])
    .withMessage('Type must be one of: task, meeting, reminder, project, personal, work, shopping, health')
]

export const validateTodoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Todo ID must be a positive integer')
]

export const validatePasswordReset = [
  body('email')
    .trim()
    .isLength({ min: 5, max: 254 })
    .matches(EMAIL_REGEX)
    .normalizeEmail()
    .withMessage('Valid email required')
]

export const validateNewPassword = [
  body('token')
    .isLength({ min: 32, max: 256 })
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Invalid reset token'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-128 characters with uppercase, lowercase, number and special character')
]

// Enhanced error handling with security logging
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    logger.warn('Validation failed', {
      endpoint: req.path,
      method: req.method,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
      ip: req.ip
    })
    
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// Additional security validations
export const validateRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0')
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (contentLength > maxSize) {
    logger.warn('Oversized request', {
      contentLength,
      maxSize,
      ip: req.ip
    })
    return res.status(413).json({ error: 'Request too large' })
  }
  next()
}

export const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('Invalid content type', {
        contentType,
        ip: req.ip
      })
      return res.status(415).json({ error: 'Content-Type must be application/json' })
    }
  }
  next()
}