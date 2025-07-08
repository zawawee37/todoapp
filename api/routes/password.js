import express from 'express'
import { requestPasswordReset, resetPassword } from '../controllers/passwordController.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

const validatePasswordReset = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
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

router.post('/request-reset', requestPasswordReset)
router.post('/reset', validatePasswordReset, handleValidationErrors, resetPassword)

export default router