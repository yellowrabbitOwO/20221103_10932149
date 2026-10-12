import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { useState } from 'react'
import type { Todo } from '../../types'
import { TodoItem } from './TodoItem'

const WEEKDAY_LABEL = ['日', '一', '二', '三', '四', '五', '六']

function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function CalendarView({
  todos,
  onToggle,
  onDelete,
}: {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const dated = todos.filter((t) => t.dueAt)
  const undated = todos.filter((t) => !t.dueAt)

  const countByDate = new Map<string, number>()
  for (const todo of dated) {
    const key = dateKey(new Date(todo.dueAt as string))
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1)
  }

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const selectedKey = dateKey(selectedDate)
  const selectedTodos = dated
    .filter((t) => dateKey(new Date(t.dueAt as string)) === selectedKey)
    .sort((a, b) => new Date(a.dueAt as string).getTime() - new Date(b.dueAt as string).getTime())

  return (
    <div>
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label="上個月"
          className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-slate-800">{format(month, 'yyyy年 M月')}</span>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="下個月"
          className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-slate-400">
        {WEEKDAY_LABEL.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = dateKey(day)
          const inMonth = isSameMonth(day, month)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          const count = countByDate.get(key) ?? 0

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`mx-auto flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-full text-xs transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white'
                  : inMonth
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={isToday && !isSelected ? 'font-semibold text-slate-900' : ''}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-900'}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2">
        <p className="px-1 text-xs text-slate-400">{format(selectedDate, 'M月d日')}</p>
        <ul>
          {selectedTodos.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-400">這天沒有待辦事項</li>
          )}
          {selectedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      </div>

      {undated.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <p className="px-1 text-xs text-slate-400">沒有日期</p>
          <ul>
            {undated.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
