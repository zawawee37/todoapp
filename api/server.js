import express from 'express'
import cors from 'cors'
import { initDatabase } from './config/database.js'
import authRoutes from './routes/auth.js'
import todoRoutes from './routes/todos.js'
import passwordRoutes from './routes/password.js'
import fs from 'fs'

// Create logs directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

const app = express()
const PORT = process.env.PORT || 3001

// Initialize database
try {
  await initDatabase()
  console.log('Database initialized')
} catch (error) {
  console.error('Database init error:', error)
}

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/password', passwordRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})