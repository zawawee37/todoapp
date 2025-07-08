import { db } from '../config/database.js'
import logger from '../utils/logger.js'

export const getTodos = async (req, res) => {
  try {
    const todos = await db.allAsync(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(todos)
  } catch (error) {
    logger.error('Get todos error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body
    
    const result = await db.runAsync(
      'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)',
      [req.user.id, title, description || null]
    )
    
    const todo = await db.getAsync(
      'SELECT * FROM todos WHERE id = ?',
      [result.lastID]
    )
    
    logger.info(`Todo created by user ${req.user.id}: ${title}`)
    res.json(todo)
  } catch (error) {
    logger.error('Create todo error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.params.id)
    const { title, description, completed } = req.body
    
    const result = await db.runAsync(
      'UPDATE todos SET title = COALESCE(?, title), description = COALESCE(?, description), completed = COALESCE(?, completed), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [title, description, completed, todoId, req.user.id]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    const todo = await db.getAsync(
      'SELECT * FROM todos WHERE id = ?',
      [todoId]
    )
    
    logger.info(`Todo updated by user ${req.user.id}: ${todoId}`)
    res.json(todo)
  } catch (error) {
    logger.error('Update todo error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.params.id)
    
    const result = await db.runAsync(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [todoId, req.user.id]
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    logger.info(`Todo deleted by user ${req.user.id}: ${todoId}`)
    res.json({ message: 'Todo deleted' })
  } catch (error) {
    logger.error('Delete todo error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}