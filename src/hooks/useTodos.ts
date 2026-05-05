import { useReducer, useEffect, useCallback } from 'react'
import type { Todo, TodoAction, Priority } from '../types'

const STORAGE_KEY = 'todomaster_todos'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [action.todo, ...state]
    case 'TOGGLE':
      return state.map(t =>
        t.id === action.id ? { ...t, completed: !t.completed } : t
      )
    case 'DELETE':
      return state.filter(t => t.id !== action.id)
    case 'EDIT':
      return state.map(t =>
        t.id === action.id ? { ...t, ...action.updates } : t
      )
    case 'CLEAR_COMPLETED':
      return state.filter(t => !t.completed)
    default:
      return state
  }
}

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, loadTodos)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback(
    (
      title: string,
      description: string,
      priority: Priority,
      dueDate: string,
      tags: string[]
    ) => {
      if (!title.trim()) return
      const todo: Todo = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        tags: tags.map(t => t.trim()).filter(Boolean),
      }
      dispatch({ type: 'ADD', todo })
    },
    []
  )

  const toggleTodo = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE', id })
  }, [])

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id })
  }, [])

  const editTodo = useCallback((id: string, updates: Partial<Todo>) => {
    dispatch({ type: 'EDIT', id, updates })
  }, [])

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' })
  }, [])

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted }
}
