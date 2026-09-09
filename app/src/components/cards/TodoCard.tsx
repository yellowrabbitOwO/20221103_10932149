import { useState } from 'react'
import type { NewTodoInput } from '../../hooks/useTodos'
import { isThisWeek, isToday } from '../../lib/todos'
import type { Category, Todo } from '../../types'
import { CategoryFilter } from './CategoryFilter'
import { TodoForm } from './TodoForm'
import { TodoItem } from './TodoItem'

type ViewMode = 'today' | 'week' | 'all'

const VIEW_LABEL: Record<ViewMode, string> = { today: '今日', week: '本週', all: '全部' }

export function TodoCard({
  todos,
  onAdd,
  onToggle,
  onDelete,
}: {
  todos: Todo[]
  onAdd: (input: NewTodoInput) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [view, setView] = useState<ViewMode>('today')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [showForm, setShowForm] = useState(false)

  const now = new Date()

  const visible = todos
    .filter((todo) => {
      if (category !== 'all' && todo.category !== category) return false
      if (todo.completed) return true // keep completed items visible in their view for satisfaction
      if (view === 'today') return isToday(todo, now) || new Date(todo.dueAt) < now
      if (view === 'week') return isThisWeek(todo, now)
      return true
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    })

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">待辦事項</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
        >
          {showForm ? '關閉' : '+ 新增待辦'}
        </button>
      </div>

      {showForm && (
        <div className="mt-4">
          <TodoForm
            onSubmit={(input) => {
              onAdd(input)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-slate-100 p-1">
          {(['today', 'week', 'all'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <ul className="mt-2">
        {visible.length === 0 && (
          <li className="py-8 text-center text-sm text-slate-400">目前沒有待辦事項</li>
        )}
        {visible.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  )
}
