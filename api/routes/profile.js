import express from 'express'
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js'
import { authenticateToken } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Validation middleware
const validateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-50 characters, letters and spaces only'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required')
]

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/)
    .withMessage('New password must be 8-128 characters with uppercase, lowercase, number and special character')
]

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}

router.get('/', getProfile)
router.put('/', validateProfile, handleValidationErrors, updateProfile)
router.put('/password', validatePasswordChange, handleValidationErrors, changePassword)

export default router