import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { securityLogger } from '../utils/logger.js'

// Load environment variables
dotenv.config()

// Ensure JWT_SECRET is set and secure
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long')
}

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set()

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      securityLogger.logSuspiciousActivity('MISSING_TOKEN', 'Request without token', req.ip)
      return res.status(401).json({ error: 'Access token required' })
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      securityLogger.logSuspiciousActivity('BLACKLISTED_TOKEN', 'Attempt to use blacklisted token', req.ip)
      return res.status(401).json({ error: 'Token has been revoked' })
    }

    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
      if (err) {
        securityLogger.logSuspiciousActivity('INVALID_TOKEN', err.message, req.ip)
        return res.status(403).json({ error: 'Invalid or expired token' })
      }
      
      // Add token to request for potential blacklisting
      req.token = token
      req.user = user
      next()
    })
  } catch (error) {
    securityLogger.logSuspiciousActivity('AUTH_ERROR', error.message, req.ip)
    return res.status(500).json({ error: 'Authentication error' })
  }
}

// Logout function to blacklist token
export const blacklistToken = (token) => {
  tokenBlacklist.add(token)
  // In production, store in Redis with TTL equal to token expiry
}

// Generate secure JWT
export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn,
    algorithm: 'HS256',
    issuer: 'todo-app',
    audience: 'todo-app-users'
  })
}

export { JWT_SECRET }