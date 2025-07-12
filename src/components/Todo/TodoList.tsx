import React, { useState, useEffect } from 'react'
import { Todo, todoService } from '../../services/todoService'
import { useAuth } from '../../contexts/AuthContext'
import { TodoItem } from './TodoItem'
import { AddTodoForm } from './AddTodoForm'
import { CheckCircle, Circle, PlusCircle, Filter } from 'lucide-react'
import Card from '../Layout/Card'

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const data = await todoService.getTodos()
      setTodos(data)
    } catch (error) {
      console.error('Error loading todos:', error)
      setError('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (title: string, description: string, dueDate?: string, priority?: string, category?: string, type?: string) => {
    try {
      const newTodo = await todoService.createTodo({ 
        title, 
        description, 
        due_date: dueDate, 
        priority: priority || 'medium', 
        category: category || 'general',
        type: type || 'task'
      })
      setTodos([newTodo, ...todos])
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating todo:', error)
      setError('Failed to add todo')
    }
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await todoService.toggleTodo(parseInt(id), completed)
      setTodos(todos.map(todo => todo.id === parseInt(id) ? updatedTodo : todo))
    } catch (error) {
      console.error('Error toggling todo:', error)
      setError('Failed to update todo')
    }
  }

  const handleUpdateTodo = async (id: string, title: string, description: string, dueDate?: string, priority?: string, category?: string, type?: string) => {
    try {
      const updatedTodo = await todoService.updateTodo(parseInt(id), { 
        title, 
        description, 
        due_date: dueDate, 
        priority, 
        category,
        type
      })
      setTodos(todos.map(todo => todo.id === parseInt(id) ? updatedTodo : todo))
    } catch (error) {
      console.error('Error updating todo:', error)
      setError('Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(parseInt(id))
      setTodos(todos.filter(todo => todo.id !== parseInt(id)))
    } catch (error) {
      console.error('Error deleting todo:', error)
      setError('Failed to delete todo')
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your todos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Tasks</p>
              <p className="text-2xl font-bold">{totalCount - completedCount}</p>
            </div>
            <Circle className="h-8 w-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Tasks</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-200">Progress</div>
              <div className="text-sm font-semibold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Todo Section */}
      <Card 
        title="Quick Actions" 
        icon={<div className="p-2 bg-blue-100 rounded-lg"><PlusCircle className="h-5 w-5 text-blue-600" /></div>}
        headerAction={
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Todo</span>
          </button>
        }
      >
        {showAddForm ? (
          <AddTodoForm
            onAdd={handleAddTodo}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <p className="text-gray-600">Click the button above to add a new todo item.</p>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="text-red-700">{error}</div>
        </Card>
      )}

      {/* Todo List */}
      <Card 
        title="Your Tasks" 
        subtitle={`${todos.length} total tasks`}
        icon={<div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>}
        headerAction={
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        }
      >
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No todos yet</h3>
            <p className="text-gray-600">Create your first todo to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}