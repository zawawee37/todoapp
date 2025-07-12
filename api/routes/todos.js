import express from 'express'
import { getTodos, createTodo, updateTodo, deleteTodo, getAnalytics, getCalendarData } from '../controllers/todoController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validateTodo, validateTodoId, handleValidationErrors } from '../utils/validation.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

router.get('/', getTodos)
router.get('/analytics', getAnalytics)
router.get('/calendar', getCalendarData)
router.post('/', validateTodo, handleValidationErrors, createTodo)
router.put('/:id', validateTodoId, validateTodo, handleValidationErrors, updateTodo)
router.delete('/:id', validateTodoId, handleValidationErrors, deleteTodo)

export default router