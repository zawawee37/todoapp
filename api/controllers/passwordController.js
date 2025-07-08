import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../config/database.js'
import logger from '../utils/logger.js'

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await db.getAsync('SELECT id, email FROM users WHERE email = ?', [email])
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset link will be sent' })
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    // Store reset token in database
    await db.runAsync(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, new Date(Date.now() + RESET_TOKEN_EXPIRY).toISOString(), user.id]
    )
    
    // In production, send email here
    logger.info(`Password reset requested for: ${email}`)
    console.log(`Reset token for ${email}: ${resetToken}`) // For testing only
    
    res.json({ 
      message: 'If email exists, reset link will be sent',
      resetToken // Remove this in production
    })
  } catch (error) {
    logger.error('Password reset request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' })
    }
    
    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token type' })
    }
    
    // Check if token exists in database and not expired
    const user = await db.getAsync(
      'SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expires > ?',
      [decoded.userId, token, new Date().toISOString()]
    )
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password and clear reset token
    await db.runAsync(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, failed_attempts = 0, locked_until = NULL WHERE id = ?',
      [hashedPassword, user.id]
    )
    
    logger.info(`Password reset completed for user: ${user.email}`)
    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    logger.error('Password reset error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}