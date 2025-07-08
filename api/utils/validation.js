import { body, validationResult } from 'express-validator'

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
]

export const validateSignin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
]

export const validateTodo = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters')
]

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}