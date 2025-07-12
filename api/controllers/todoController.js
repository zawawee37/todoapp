import { db } from '../config/database.js'
import logger from '../utils/logger.js'

export const getTodos = async (req, res) => {
  try {
    const { priority, category, completed } = req.query
    let query = 'SELECT * FROM todos WHERE user_id = ?'
    const params = [req.user.id]
    
    if (priority) {
      query += ' AND priority = ?'
      params.push(priority)
    }
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    if (completed !== undefined) {
      query += ' AND completed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }
    
    query += ' ORDER BY CASE priority WHEN "urgent" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 ELSE 4 END, due_date ASC, created_at DESC'
    
    const todos = await db.allAsync(query, params)
    res.json(todos)
  } catch (error) {
    logger.error('Get todos error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createTodo = async (req, res) => {
  try {
    const { title, description, due_date, priority = 'medium', category = 'general', type = 'task' } = req.body
    
    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' })
    }
    
    logger.info('Creating todo:', { title, priority, category, type, userId: req.user.id })
    
    const result = await db.runAsync(
      'INSERT INTO todos (user_id, title, description, due_date, priority, category, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title.trim(), description?.trim() || null, due_date || null, priority, category, type]
    )
    
    const todo = await db.getAsync(
      'SELECT * FROM todos WHERE id = ?',
      [result.lastID]
    )
    
    logger.info(`Todo created successfully by user ${req.user.id}: ${title}`)
    res.json(todo)
  } catch (error) {
    logger.error('Create todo error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body
    })
    res.status(500).json({ error: 'Failed to create todo', details: error.message })
  }
}

export const updateTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.params.id)
    const { title, description, completed, due_date, priority, category, type } = req.body
    
    // Convert completed to proper boolean/integer
    let completedValue = completed
    if (completed !== undefined) {
      completedValue = completed ? 1 : 0
    }
    
    const result = await db.runAsync(
      'UPDATE todos SET title = COALESCE(?, title), description = COALESCE(?, description), completed = COALESCE(?, completed), due_date = COALESCE(?, due_date), priority = COALESCE(?, priority), category = COALESCE(?, category), type = COALESCE(?, type), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [title, description, completedValue, due_date, priority, category, type, todoId, req.user.id]
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

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    
    const [total, completed, overdue, byPriority, byCategory, byType, todayCreated, weekCreated, monthCreated, recentActivity] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ?', [userId]),
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND completed = 1', [userId]),
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND due_date < datetime("now") AND completed = 0', [userId]),
      db.allAsync('SELECT priority, COUNT(*) as count FROM todos WHERE user_id = ? GROUP BY priority', [userId]),
      db.allAsync('SELECT category, COUNT(*) as count FROM todos WHERE user_id = ? GROUP BY category', [userId]),
      db.allAsync('SELECT type, COUNT(*) as count FROM todos WHERE user_id = ? GROUP BY type', [userId]),
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND date(created_at) = date("now")', [userId]),
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND created_at >= datetime("now", "-7 days")', [userId]),
      db.getAsync('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND created_at >= datetime("now", "-30 days")', [userId]),
      db.allAsync('SELECT date(created_at) as date, COUNT(*) as count FROM todos WHERE user_id = ? AND created_at >= datetime("now", "-30 days") GROUP BY date(created_at) ORDER BY date DESC LIMIT 30', [userId])
    ])
    
    // Calculate productivity metrics
    const avgCompletionTime = await db.getAsync(`
      SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days 
      FROM todos 
      WHERE user_id = ? AND completed = 1 AND updated_at IS NOT NULL
    `, [userId])
    
    // Get upcoming deadlines
    const upcomingDeadlines = await db.allAsync(`
      SELECT title, due_date, priority, type 
      FROM todos 
      WHERE user_id = ? AND completed = 0 AND due_date IS NOT NULL 
      AND due_date > datetime('now') 
      ORDER BY due_date ASC 
      LIMIT 5
    `, [userId])
    
    // Get productivity trends
    const weeklyTrend = await db.allAsync(`
      SELECT 
        strftime('%W', created_at) as week,
        COUNT(*) as created,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
      FROM todos 
      WHERE user_id = ? AND created_at >= datetime('now', '-8 weeks')
      GROUP BY strftime('%W', created_at)
      ORDER BY week DESC
      LIMIT 8
    `, [userId])
    
    res.json({
      // Basic stats
      total: total.count,
      completed: completed.count,
      pending: total.count - completed.count,
      overdue: overdue.count,
      completionRate: total.count > 0 ? Math.round((completed.count / total.count) * 100) : 0,
      
      // Distribution
      byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item.count }), {}),
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
      
      // Time-based metrics
      todayCreated: todayCreated.count,
      weekCreated: weekCreated.count,
      monthCreated: monthCreated.count,
      
      // Productivity metrics
      avgCompletionTime: avgCompletionTime?.avg_days ? Math.round(avgCompletionTime.avg_days * 10) / 10 : 0,
      
      // Trends
      recentActivity: recentActivity,
      weeklyTrend: weeklyTrend,
      
      // Upcoming
      upcomingDeadlines: upcomingDeadlines
    })
  } catch (error) {
    logger.error('Get analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query
    const userId = req.user.id
    
    let query = 'SELECT * FROM todos WHERE user_id = ? AND due_date IS NOT NULL'
    const params = [userId]
    
    if (month && year) {
      query += ' AND strftime("%m", due_date) = ? AND strftime("%Y", due_date) = ?'
      params.push(month.padStart(2, '0'), year)
    }
    
    query += ' ORDER BY due_date ASC'
    
    const todos = await db.allAsync(query, params)
    res.json(todos)
  } catch (error) {
    logger.error('Get calendar data error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}