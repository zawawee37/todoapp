import { db } from '../config/database.js'
import bcrypt from 'bcryptjs'
import logger from '../utils/logger.js'

export const getProfile = async (req, res) => {
  try {
    const user = await db.getAsync(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.user.id
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.getAsync(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      )
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }
    
    const result = await db.runAsync(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, userId]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const updatedUser = await db.getAsync(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId]
    )
    
    logger.info(`Profile updated for user ${userId}`)
    res.json(updatedUser)
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id
    
    // Get current user
    const user = await db.getAsync(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    await db.runAsync(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    )
    
    logger.info(`Password changed for user ${userId}`)
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}