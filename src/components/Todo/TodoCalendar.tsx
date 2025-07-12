import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { AddTodoForm } from './AddTodoForm';
import { todoService } from '../../services/todoService';
import Card from '../Layout/Card';

interface Todo {
  id: number;
  title: string;
  due_date: string;
  priority: string;
  completed: boolean;
}

const TodoCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      const token = localStorage.getItem('token');
      const month = (currentDate.getMonth() + 1).toString();
      const year = currentDate.getFullYear().toString();
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/todos/calendar?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTodosForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return todos.filter(todo => todo.due_date?.startsWith(dateStr));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const priorityColors = {
    urgent: 'bg-red-100 border-red-300 text-red-800',
    high: 'bg-orange-100 border-orange-300 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-green-100 border-green-300 text-green-800'
  };

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

  const handleAddTodo = async (title: string, description: string, dueDate?: string, priority?: string, category?: string, type?: string) => {
    try {
      await todoService.createTodo({ 
        title, 
        description, 
        due_date: dueDate || selectedDate, 
        priority: priority || 'medium', 
        category: category || 'general',
        type: type || 'task'
      });
      setShowAddForm(false);
      setSelectedDate('');
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00`;
    setSelectedDate(dateStr);
    setShowAddForm(true);
  };

  if (loading) return <div className="p-6">Loading calendar...</div>;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="p-4 lg:p-8">
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Add Todo for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Selected Date'}
              </h3>
              <AddTodoForm
                onAdd={handleAddTodo}
                onCancel={() => {
                  setShowAddForm(false);
                  setSelectedDate('');
                }}
                initialDueDate={selectedDate}
              />
            </div>
          </div>
        </div>
      )}
      
      <Card 
        title={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        subtitle="Click on any date to add a new todo"
        icon={<div className="p-2 bg-purple-100 rounded-lg"><Calendar className="h-5 w-5 text-purple-600" /></div>}
        headerAction={
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        }
      >


        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="p-1 sm:p-2 text-center font-semibold text-gray-600 text-xs sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="p-1 h-16 sm:h-24"></div>
          ))}
          
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayTodos = getTodosForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            
            return (
              <div
                key={day}
                className={`p-1 h-16 sm:h-24 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative group ${
                  isToday ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="font-semibold text-xs sm:text-sm mb-1 flex items-center justify-between">
                  <span>{day}</span>
                  <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayTodos.slice(0, window.innerWidth < 640 ? 1 : 2).map(todo => (
                    <div
                      key={todo.id}
                      className={`text-xs p-1 rounded border ${priorityColors[todo.priority as keyof typeof priorityColors]} ${
                        todo.completed ? 'line-through opacity-60' : ''
                      } flex items-center gap-1`}
                      title={`${typeIcons[todo.type as keyof typeof typeIcons]} ${todo.title}`}
                    >
                      <span className="text-xs">{typeIcons[todo.type as keyof typeof typeIcons]}</span>
                      <span className="truncate">
                        {todo.title.length > (window.innerWidth < 640 ? 8 : 12) 
                          ? `${todo.title.substring(0, window.innerWidth < 640 ? 8 : 12)}...` 
                          : todo.title}
                      </span>
                    </div>
                  ))}
                  {dayTodos.length > (window.innerWidth < 640 ? 1 : 2) && (
                    <div className="text-xs text-gray-500">+{dayTodos.length - (window.innerWidth < 640 ? 1 : 2)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TodoCalendar;