import { db, initDatabase } from '../config/database.js'
import bcrypt from 'bcryptjs'

const createSimpleUser = async () => {
  try {
    await initDatabase()
    
    const email = 'user@test.com'
    const password = '123456'
    const name = 'Test User'
    
    // Delete existing user if exists
    await db.runAsync('DELETE FROM users WHERE email = ?', [email])
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user
    const result = await db.runAsync(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    )
    
    console.log(`Simple user created:`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`User ID: ${result.lastID}`)
    
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    process.exit(0)
  }
}

createSimpleUser()