import { supabase, Todo, TodoInsert, TodoUpdate } from '../lib/supabase'

export const todoService = {
  async getTodos(userId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTodo(todo: Omit<TodoInsert, 'user_id'>): Promise<Todo> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todo, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTodo(id: string, updates: TodoUpdate): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed })
  }
}