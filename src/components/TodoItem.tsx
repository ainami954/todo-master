import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import type { Todo, Priority } from '../types'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, updates: Partial<Todo>) => void
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
}

function isOverdue(dueDate: string, completed: boolean): boolean {
  if (!dueDate || completed) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDesc, setEditDesc] = useState(todo.description)
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editDueDate, setEditDueDate] = useState(todo.dueDate)
  const [editTagInput, setEditTagInput] = useState('')
  const [editTags, setEditTags] = useState<string[]>(todo.tags)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const overdue = isOverdue(todo.dueDate, todo.completed)

  useEffect(() => {
    if (editing) titleInputRef.current?.focus()
  }, [editing])

  function startEdit() {
    setEditTitle(todo.title)
    setEditDesc(todo.description)
    setEditPriority(todo.priority)
    setEditDueDate(todo.dueDate)
    setEditTags([...todo.tags])
    setEditTagInput('')
    setEditing(true)
  }

  function commitEdit() {
    if (!editTitle.trim()) return
    const allTags = [...editTags]
    if (editTagInput.trim()) allTags.push(editTagInput.trim())
    onEdit(todo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      dueDate: editDueDate,
      tags: allTags,
    })
    setEditing(false)
    setEditTagInput('')
  }

  function cancelEdit() {
    setEditing(false)
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && editTagInput.trim()) {
      e.preventDefault()
      if (!editTags.includes(editTagInput.trim())) {
        setEditTags(prev => [...prev, editTagInput.trim()])
      }
      setEditTagInput('')
    } else if (e.key === 'Backspace' && !editTagInput && editTags.length > 0) {
      setEditTags(prev => prev.slice(0, -1))
    }
  }

  if (editing) {
    return (
      <li className={`todo-item editing priority-${todo.priority}`}>
        <div className="edit-form">
          <input
            ref={titleInputRef}
            className="edit-title-input"
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={handleEditKeyDown}
            aria-label="Edit title"
          />
          <textarea
            className="edit-desc-input"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={handleEditKeyDown}
            placeholder="Description…"
            rows={2}
            aria-label="Edit description"
          />
          <div className="edit-row">
            <div className="priority-group" role="group" aria-label="Priority">
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn ${editPriority === p ? 'selected' : ''}`}
                  style={
                    editPriority === p
                      ? {
                          borderColor: `var(--priority-${p})`,
                          color: `var(--priority-${p})`,
                          backgroundColor: `color-mix(in srgb, var(--priority-${p}) 12%, transparent)`,
                        }
                      : {}
                  }
                  onClick={() => setEditPriority(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <input
              className="input-date"
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              aria-label="Due date"
            />
          </div>
          <div className="tags-input-wrap">
            {editTags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => setEditTags(prev => prev.filter(t => t !== tag))}
                  aria-label={`Remove tag ${tag}`}
                >
                  &#10005;
                </button>
              </span>
            ))}
            <input
              className="input-tags"
              type="text"
              placeholder={editTags.length === 0 ? 'Tags…' : ''}
              value={editTagInput}
              onChange={e => setEditTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              aria-label="Edit tags"
            />
          </div>
          <div className="edit-actions">
            <button className="btn-save" onClick={commitEdit} disabled={!editTitle.trim()}>
              Save
            </button>
            <button className="btn-cancel" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority} ${overdue ? 'overdue' : ''}`}>
      <div className="priority-stripe" aria-hidden="true" />

      <button
        className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? `Mark "${todo.title}" as active` : `Complete "${todo.title}"`}
        aria-pressed={todo.completed}
      >
        {todo.completed && (
          <svg viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="todo-content">
        <div className="todo-main">
          <span className="todo-title">{todo.title}</span>
          <div className="todo-meta">
            <span className={`priority-badge priority-${todo.priority}`}>
              {PRIORITY_LABEL[todo.priority]}
            </span>
            {todo.dueDate && (
              <span className={`due-date ${overdue ? 'overdue-text' : ''}`}>
                {overdue ? '⚠ ' : ''}
                {formatDate(todo.dueDate)}
              </span>
            )}
          </div>
        </div>

        {todo.tags.length > 0 && (
          <div className="todo-tags">
            {todo.tags.map(tag => (
              <span key={tag} className="tag tag-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {todo.description && (
          <div className={`todo-desc-wrap ${expanded ? 'open' : ''}`}>
            {expanded ? (
              <p className="todo-desc">{todo.description}</p>
            ) : (
              <button className="btn-expand-desc" onClick={() => setExpanded(true)}>
                Show description
              </button>
            )}
            {expanded && (
              <button className="btn-expand-desc" onClick={() => setExpanded(false)}>
                Hide description
              </button>
            )}
          </div>
        )}
      </div>

      <div className="todo-actions">
        <button
          className="action-btn edit-btn"
          onClick={startEdit}
          aria-label={`Edit "${todo.title}"`}
          title="Edit"
        >
          &#9998;
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete "${todo.title}"`}
          title="Delete"
        >
          &#128465;
        </button>
      </div>
    </li>
  )
}
