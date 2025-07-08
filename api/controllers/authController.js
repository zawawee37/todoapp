import bcrypt from 'bcryptjs'
import { generateToken } from '../middleware/auth.js'
import { db } from '../config/database.js'
import logger, { securityLogger } from '../utils/logger.js'
import crypto from 'crypto'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes
const BCRYPT_ROUNDS = 12

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const ip = req.ip
    const userAgent = req.get('User-Agent')
    
    // Check if user exists
    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      securityLogger.logSuspiciousActivity('DUPLICATE_SIGNUP', { email }, ip)
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password with secure rounds
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)
    
    const result = await db.runAsync(
      'INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name || null, new Date().toISOString()]
    )
    
    const userId = result.lastID
    const token = generateToken({ id: userId, email })
    
    logger.info(`User registered: ${email} with ID: ${userId}`, { ip, userAgent })
    res.json({ 
      token, 
      user: { id: userId, email, name: name || null },
      expiresIn: '24h'
    })
  } catch (error) {
    logger.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body
    const ip = req.ip
    const userAgent = req.get('User-Agent')
    
    const user = await db.getAsync(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    )
    
    if (!user) {
      securityLogger.logFailedLogin(email, ip, userAgent)
      // Use constant time delay to prevent user enumeration
      await new Promise(resolve => setTimeout(resolve, 1000))
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      securityLogger.logSuspiciousActivity('LOCKED_ACCOUNT_ACCESS', { email }, ip)
      return res.status(423).json({ 
        error: 'Account temporarily locked due to multiple failed attempts',
        retryAfter: Math.ceil((new Date(user.locked_until) - new Date()) / 1000 / 60)
      })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      // Increment failed attempts
      const newFailedAttempts = (user.failed_attempts || 0) + 1
      const lockUntil = newFailedAttempts >= MAX_FAILED_ATTEMPTS 
        ? new Date(Date.now() + LOCKOUT_TIME).toISOString()
        : null
      
      await db.runAsync(
        'UPDATE users SET failed_attempts = ?, locked_until = ?, last_failed_login = ? WHERE id = ?',
        [newFailedAttempts, lockUntil, new Date().toISOString(), user.id]
      )
      
      securityLogger.logFailedLogin(email, ip, userAgent)
      
      if (lockUntil) {
        securityLogger.logAccountLocked(email, ip)
      }
      
      // Use constant time delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Reset failed attempts on successful login
    await db.runAsync(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?',
      [new Date().toISOString(), user.id]
    )
    
    const token = generateToken({ id: user.id, email: user.email })
    
    securityLogger.logSuccessfulLogin(email, ip)
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name },
      expiresIn: '24h'
    })
  } catch (error) {
    logger.error('Signin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const logout = async (req, res) => {
  try {
    const { blacklistToken } = await import('../middleware/auth.js')
    
    if (req.token) {
      blacklistToken(req.token)
    }
    
    logger.info(`User logged out: ${req.user.email}`, { ip: req.ip })
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    logger.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}