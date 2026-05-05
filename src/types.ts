export type Priority = 'low' | 'medium' | 'high'
export type Filter = 'all' | 'active' | 'completed'
export type SortKey = 'created' | 'priority' | 'dueDate' | 'alpha'

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  dueDate: string
  createdAt: string
  tags: string[]
}

export type TodoAction =
  | { type: 'ADD'; todo: Todo }
  | { type: 'TOGGLE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'EDIT'; id: string; updates: Partial<Todo> }
  | { type: 'CLEAR_COMPLETED' }
