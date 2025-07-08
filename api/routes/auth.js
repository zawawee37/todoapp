import express from 'express'
import { signup, signin, logout } from '../controllers/authController.js'
import { validateSignup, validateSignin, handleValidationErrors } from '../utils/validation.js'
import { authLimiter } from '../middleware/security.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Apply auth rate limiting to all auth routes
router.use(authLimiter)

router.post('/signup', validateSignup, handleValidationErrors, signup)
router.post('/signin', validateSignin, handleValidationErrors, signin)
router.post('/logout', authenticateToken, logout)

export default router