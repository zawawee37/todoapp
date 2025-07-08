import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWT_SECRET } from '../middleware/auth.js'
import { db } from '../config/database.js'
import logger from '../utils/logger.js'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Check if user exists
    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    
    const result = await db.runAsync(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    )
    
    const userId = result.lastID
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' })
    
    console.log(`User registered: ${email} with ID: ${userId}`)
    res.json({ token, user: { id: userId, email } })
  } catch (error) {
    logger.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await db.getAsync(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    )
    
    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      logger.warn(`Login attempt on locked account: ${email}`)
      return res.status(423).json({ error: 'Account temporarily locked' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      // Increment failed attempts
      const newFailedAttempts = user.failed_attempts + 1
      const lockUntil = newFailedAttempts >= MAX_FAILED_ATTEMPTS 
        ? new Date(Date.now() + LOCKOUT_TIME).toISOString()
        : null
      
      await db.runAsync(
        'UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?',
        [newFailedAttempts, lockUntil, user.id]
      )
      
      logger.warn(`Failed login attempt ${newFailedAttempts}/${MAX_FAILED_ATTEMPTS} for: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Reset failed attempts on successful login
    await db.runAsync(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?',
      [user.id]
    )
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
    
    logger.info(`User logged in: ${email}`)
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (error) {
    logger.error('Signin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}