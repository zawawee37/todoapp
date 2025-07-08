import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const db = new sqlite3.Database('./database.sqlite')

// Promisify database methods with proper context
db.runAsync = function(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}
db.getAsync = promisify(db.get.bind(db))
db.allAsync = promisify(db.all.bind(db))

// Initialize database tables
const initDatabase = async () => {
  try {
    // Users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME NULL,
        reset_token TEXT NULL,
        reset_token_expires DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Todos table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

export { db, initDatabase }