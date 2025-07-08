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
    // Users table with enhanced security fields
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME NULL,
        reset_token TEXT NULL,
        reset_token_expires DATETIME NULL,
        last_login DATETIME NULL,
        last_failed_login DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create indexes for performance and security
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)')

    // Todos table with proper constraints
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL CHECK(length(title) <= 200),
        description TEXT CHECK(length(description) <= 1000),
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    
    // Create indexes for performance
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at)')
    
    // Security audit log table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type)')
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at)')

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

export { db, initDatabase }