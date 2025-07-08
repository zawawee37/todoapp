import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './config/database.js'
import authRoutes from './routes/auth.js'
import todoRoutes from './routes/todos.js'
import passwordRoutes from './routes/password.js'
import {
  securityHeaders,
  generalLimiter,
  speedLimiter,
  sanitizeInput,
  requestSizeLimiter,
  corsOptions
} from './middleware/security.js'
import { requestLogger, errorLogger } from './utils/logger.js'
import { validateRequestSize, validateContentType } from './utils/validation.js'
import fs from 'fs'

// Load environment variables
dotenv.config()

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET must be set and at least 32 characters long')
  process.exit(1)
}

// Create logs directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Initialize database
try {
  await initDatabase()
  console.log('Database initialized')
} catch (error) {
  console.error('Database init error:', error)
  process.exit(1)
}

// Security middleware (order matters)
app.use(securityHeaders)
app.use(cors(corsOptions))
app.use(generalLimiter)
app.use(speedLimiter)

// Request parsing with size limits
app.use(express.json(requestSizeLimiter.json))
app.use(express.urlencoded(requestSizeLimiter.urlencoded))

// Additional security validations
app.use(validateRequestSize)
app.use(validateContentType)
app.use(sanitizeInput)

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/password', passwordRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error logging middleware
app.use(errorLogger)

// Global error handling middleware
app.use((error, req, res, next) => {
  // Don't log client errors (4xx)
  if (error.status >= 500 || !error.status) {
    console.error('Unhandled error:', error)
  }
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  const message = isDevelopment ? error.message : 'Internal server error'
  
  res.status(error.status || 500).json({ 
    error: message,
    ...(isDevelopment && { stack: error.stack })
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})