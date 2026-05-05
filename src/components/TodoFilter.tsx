import type { Filter, SortKey } from '../types'

interface Props {
  filter: Filter
  onFilterChange: (f: Filter) => void
  search: string
  onSearchChange: (s: string) => void
  sortKey: SortKey
  onSortChange: (s: SortKey) => void
  onClearCompleted: () => void
  hasCompleted: boolean
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'created', label: 'Newest' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'alpha', label: 'A–Z' },
]

export function TodoFilter({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  sortKey,
  onSortChange,
  onClearCompleted,
  hasCompleted,
}: Props) {
  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon">&#128269;</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search todos…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          aria-label="Search todos"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            &#10005;
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-tabs" role="tablist" aria-label="Filter todos">
          {FILTERS.map(f => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sortKey}
          onChange={e => onSortChange(e.target.value as SortKey)}
          aria-label="Sort todos"
        >
          {SORTS.map(s => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {hasCompleted && (
          <button className="btn-clear" onClick={onClearCompleted}>
            Clear done
          </button>
        )}
      </div>
    </div>
  )
}
