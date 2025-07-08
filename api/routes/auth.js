import express from 'express'
import { signup, signin } from '../controllers/authController.js'
import { validateSignup, validateSignin, handleValidationErrors } from '../utils/validation.js'

const router = express.Router()

router.post('/signup', validateSignup, handleValidationErrors, signup)
router.post('/signin', validateSignin, handleValidationErrors, signin)

export default router