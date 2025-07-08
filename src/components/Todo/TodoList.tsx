import React, { useState, useEffect } from 'react'
import { Todo, todoService } from '../../services/todoService'
import { useAuth } from '../../contexts/AuthContext'
import { TodoItem } from './TodoItem'
import { AddTodoForm } from './AddTodoForm'
import { LogOut, CheckCircle, Circle, PlusCircle } from 'lucide-react'

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

  const handleAddTodo = async (title: string, description: string) => {
    try {
      const newTodo = await todoService.createTodo({ title, description })
      setTodos([newTodo, ...todos])
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating todo:', error)
      setError('Failed to add todo')
    }
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await todoService.toggleTodo(id, completed)
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
    } catch (error) {
      console.error('Error toggling todo:', error)
      setError('Failed to update todo')
    }
  }

  const handleUpdateTodo = async (id: string, title: string, description: string) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, { title, description })
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
    } catch (error) {
      console.error('Error updating todo:', error)
      setError('Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Circle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {totalCount - completedCount} active
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {completedCount} completed
              </span>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Todo Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add new todo</span>
          </button>
        </div>

        {/* Add Todo Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddTodoForm
              onAdd={handleAddTodo}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No todos yet</h3>
              <p className="text-gray-600">Create your first todo to get started!</p>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}