import type { Todo } from '../types'

interface Props {
  todos: Todo[]
}

export function TodoStats({ todos }: Props) {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const active = total - completed
  const highPriority = todos.filter(t => t.priority === 'high' && !t.completed).length
  const overdue = todos.filter(t => {
    if (!t.dueDate || t.completed) return false
    return new Date(t.dueDate) < new Date(new Date().toDateString())
  }).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="stats">
      <div className="stat-cards">
        <div className="stat-card stat-total">
          <span className="stat-number">{total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-active">
          <span className="stat-number">{active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card stat-done">
          <span className="stat-number">{completed}</span>
          <span className="stat-label">Done</span>
        </div>
        {highPriority > 0 && (
          <div className="stat-card stat-urgent">
            <span className="stat-number">{highPriority}</span>
            <span className="stat-label">Urgent</span>
          </div>
        )}
        {overdue > 0 && (
          <div className="stat-card stat-overdue">
            <span className="stat-number">{overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        )}
      </div>
      {total > 0 && (
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <span className="progress-label">{progress}% complete</span>
        </div>
      )}
    </div>
  )
}
