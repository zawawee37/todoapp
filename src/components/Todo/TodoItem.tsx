import React, { useState } from 'react'
import { Todo } from '../../lib/supabase'
import { Check, X, Edit3, Trash2 } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onUpdate: (id: string, title: string, description: string) => void
  onDelete: (id: string) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, editTitle.trim(), editDescription.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Todo title"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="Description (optional)"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md ${todo.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 ${todo.completed ? 'line-through' : ''}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className={`text-sm text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}`}>
              {todo.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(todo.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}