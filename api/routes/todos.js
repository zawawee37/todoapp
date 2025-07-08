import express from 'express'
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validateTodo, handleValidationErrors } from '../utils/validation.js'

const router = express.Router()

router.get('/', authenticateToken, getTodos)
router.post('/', authenticateToken, validateTodo, handleValidationErrors, createTodo)
router.put('/:id', authenticateToken, updateTodo)
router.delete('/:id', authenticateToken, deleteTodo)

export default router