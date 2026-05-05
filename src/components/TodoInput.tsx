import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import type { Priority } from '../types'

interface Props {
  onAdd: (
    title: string,
    description: string,
    priority: Priority,
    dueDate: string,
    tags: string[]
  ) => void
}

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'low', label: 'Low', color: 'var(--priority-low)' },
  { key: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
  { key: 'high', label: 'High', color: 'var(--priority-high)' },
]

export function TodoInput({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const allTags = [...tags]
    if (tagInput.trim()) allTags.push(tagInput.trim())
    onAdd(title, description, priority, dueDate, allTags)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setTagInput('')
    setTags([])
    setExpanded(false)
    titleRef.current?.focus()
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <div className="input-main-row">
        <input
          ref={titleRef}
          className="input-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          aria-label="New todo title"
          autoFocus
        />
        <button
          type="button"
          className={`btn-expand ${expanded ? 'rotated' : ''}`}
          onClick={() => setExpanded(v => !v)}
          aria-label="Toggle extra fields"
          aria-expanded={expanded}
          tabIndex={-1}
        >
          &#9660;
        </button>
        <button
          type="submit"
          className="btn-add"
          disabled={!title.trim()}
          aria-label="Add todo"
        >
          Add
        </button>
      </div>

      {expanded && (
        <div className="input-extras">
          <textarea
            className="input-description"
            placeholder="Description (optional)…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            aria-label="Description"
          />

          <div className="input-row">
            <div className="priority-group" role="group" aria-label="Priority">
              {PRIORITIES.map(p => (
                <button
                  key={p.key}
                  type="button"
                  className={`priority-btn ${priority === p.key ? 'selected' : ''}`}
                  style={
                    priority === p.key
                      ? { borderColor: p.color, color: p.color, backgroundColor: `${p.color}18` }
                      : {}
                  }
                  onClick={() => setPriority(p.key)}
                  aria-pressed={priority === p.key}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              className="input-date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              aria-label="Due date"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="tags-input-wrap">
            {tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                >
                  &#10005;
                </button>
              </span>
            ))}
            <input
              className="input-tags"
              type="text"
              placeholder={tags.length === 0 ? 'Add tags (Enter or comma to add)…' : ''}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              aria-label="Tags"
            />
          </div>
        </div>
      )}
    </form>
  )
}
