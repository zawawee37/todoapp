import { db, initDatabase } from '../config/database.js'
import bcrypt from 'bcryptjs'

const createTestUser = async () => {
  try {
    await initDatabase()
    
    const email = 'test@gmail.com'
    const password = 'Test123!'
    const name = 'Test User'
    
    // Check if user already exists
    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email])
    
    if (existingUser) {
      console.log('Test user already exists')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user
    const result = await db.runAsync(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    )
    
    console.log(`Test user created successfully:`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`User ID: ${result.lastID}`)
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    process.exit(0)
  }
}

createTestUser()