import { useState, useMemo } from 'react'
import { useTodos } from './hooks/useTodos'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { TodoFilter } from './components/TodoFilter'
import { TodoStats } from './components/TodoStats'
import type { Filter, SortKey, Todo } from './types'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const

function sortTodos(todos: Todo[], sortKey: SortKey): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    switch (sortKey) {
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      case 'dueDate': {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      case 'alpha':
        return a.title.localeCompare(b.title)
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
}

export default function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('todomaster_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  function toggleTheme() {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('todomaster_theme', next ? 'dark' : 'light')
      return next
    })
  }

  const filteredTodos = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = todos.filter(todo => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed)
      const matchesSearch =
        !q ||
        todo.title.toLowerCase().includes(q) ||
        todo.description.toLowerCase().includes(q) ||
        todo.tags.some(t => t.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
    return sortTodos(filtered, sortKey)
  }, [todos, filter, search, sortKey])

  const emptyMessage = useMemo(() => {
    if (search) return 'No todos match your search.'
    if (filter === 'completed') return 'No completed todos yet. Keep going!'
    if (filter === 'active') return 'All done! No active todos.'
    return 'No todos yet. Add one above to get started!'
  }, [filter, search])

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity=".15" />
                <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1>TodoMaster</h1>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17a5 5 0 100-10 5 5 0 000 10zm0-13V2m0 20v-2m-7.07-2.93L3.51 5.64M20.49 18.36l-1.42-1.42M1 12h2m18 0h2M4.93 6.93L3.51 5.51M20.49 5.51l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <TodoStats todos={todos} />
          <TodoInput onAdd={addTodo} />
          <TodoFilter
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            sortKey={sortKey}
            onSortChange={setSortKey}
            onClearCompleted={clearCompleted}
            hasCompleted={todos.some(t => t.completed)}
          />
          {filteredTodos.length > 0 ? (
            <TodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ) : (
            <div className="empty-state" role="status">
              <div className="empty-icon" aria-hidden="true">
                {filter === 'completed' ? '🎯' : filter === 'active' && todos.length > 0 ? '🎉' : '📝'}
              </div>
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
