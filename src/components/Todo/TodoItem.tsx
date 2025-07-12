import React, { useState } from 'react'
import { Todo } from '../../services/todoService'
import { Check, X, Edit3, Trash2 } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onUpdate: (id: number, title: string, description: string, dueDate?: string, priority?: string, category?: string, type?: string) => void
  onDelete: (id: number) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? todo.due_date.slice(0, 16) : '')
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium')
  const [editCategory, setEditCategory] = useState(todo.category || 'general')
  const [editType, setEditType] = useState(todo.type || 'task')

  const typeIcons = {
    task: '📋',
    meeting: '🤝',
    reminder: '⏰',
    project: '🚀',
    personal: '👤',
    work: '💼',
    shopping: '🛒',
    health: '🏥'
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(String(todo.id), editTitle.trim(), editDescription.trim(), editDueDate || undefined, editPriority, editCategory, editType)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditDueDate(todo.due_date ? todo.due_date.slice(0, 16) : '')
    setEditPriority(todo.priority || 'medium')
    setEditCategory(todo.category || 'general')
    setEditType(todo.type || 'task')
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="task">📋 Task</option>
              <option value="meeting">🤝 Meeting</option>
              <option value="reminder">⏰ Reminder</option>
              <option value="project">🚀 Project</option>
              <option value="personal">👤 Personal</option>
              <option value="work">💼 Work</option>
              <option value="shopping">🛒 Shopping</option>
              <option value="health">🏥 Health</option>
            </select>
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="Category"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="flex items-center justify-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${todo.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(String(todo.id), !todo.completed)}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            todo.completed
              ? 'bg-green-500 border-green-500 text-white shadow-md'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }`}
        >
          {todo.completed && <Check className="h-4 w-4" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-lg">{typeIcons[todo.type as keyof typeof typeIcons]}</span>
            <h3 className={`font-semibold text-gray-900 flex-1 ${todo.completed ? 'line-through' : ''}`}>
              {todo.title}
            </h3>
          </div>
          {todo.description && (
            <p className={`text-sm text-gray-600 mt-1 ${todo.completed ? 'line-through' : ''}`}>
              {todo.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              todo.priority === 'urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
              todo.priority === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {todo.priority === 'urgent' ? '🔴' : 
               todo.priority === 'high' ? '🟠' :
               todo.priority === 'medium' ? '🟡' : '🟢'} {todo.priority}
            </span>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              {typeIcons[todo.type as keyof typeof typeIcons]} {todo.type}
            </span>
            {todo.category && todo.category !== 'general' && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                {todo.category}
              </span>
            )}
            {todo.due_date && (
              <span className={`px-2 py-1 text-xs rounded-full border ${
                new Date(todo.due_date) < new Date() && !todo.completed
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                📅 {new Date(todo.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Created: {new Date(todo.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(String(todo.id))}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}