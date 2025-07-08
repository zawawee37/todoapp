export interface Todo {
  id: number
  user_id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export type TodoInsert = Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TodoUpdate = Partial<Omit<Todo, 'id' | 'user_id' | 'created_at'>>

const API_URL = 'http://localhost:3001/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const todoService = {
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${API_URL}/todos`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to fetch todos')
    return response.json()
  },

  async createTodo(todo: TodoInsert): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(todo)
    })
    
    if (!response.ok) throw new Error('Failed to create todo')
    return response.json()
  },

  async updateTodo(id: number, updates: TodoUpdate): Promise<Todo> {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) throw new Error('Failed to update todo')
    return response.json()
  },

  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Failed to delete todo')
  },

  async toggleTodo(id: number, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed })
  }
}