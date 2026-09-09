import { format } from 'date-fns'
import { isOverdue } from '../../lib/todos'
import type { Todo } from '../../types'
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types'

export function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const overdue = isOverdue(todo, new Date())

  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '標記為未完成' : '標記為已完成'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? 'border-slate-900 bg-slate-900'
            : 'border-slate-300 hover:border-slate-500'
        }`}
      >
        {todo.completed && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-white">
            <path d="M4.5 8.5 1.5 5.5l1-1 2 2 4-4 1 1z" />
          </svg>
        )}
      </button>

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_COLOR[todo.category]}`} />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}
        >
          {todo.title}
        </p>
        <p className="text-xs text-slate-400">
          {CATEGORY_LABEL[todo.category]} · {format(new Date(todo.dueAt), 'MM/dd HH:mm')}
          {todo.repeat.type !== 'none' && ' · 重複'}
        </p>
      </div>

      {overdue && (
        <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-500">
          逾期
        </span>
      )}

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label="刪除待辦"
        className="shrink-0 text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <path d="M6 2h4a1 1 0 0 1 1 1v1h3v1.5H2V4h3V3a1 1 0 0 1 1-1zm-2 4h8l-.6 8.1a1 1 0 0 1-1 .9H5.6a1 1 0 0 1-1-.9L4 6z" />
        </svg>
      </button>
    </li>
  )
}
