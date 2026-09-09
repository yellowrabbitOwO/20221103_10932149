import { format } from 'date-fns'
import { useState } from 'react'
import type { NewTodoInput } from '../../hooks/useTodos'
import type { Category, RepeatType } from '../../types'
import { CATEGORY_LABEL } from '../../types'

const WEEKDAY_LABEL = ['日', '一', '二', '三', '四', '五', '六']

function defaultDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30, 0, 0)
  return format(now, "yyyy-MM-dd'T'HH:mm")
}

export function TodoForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: NewTodoInput) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('life')
  const [dateTime, setDateTime] = useState(defaultDateTime())
  const [repeatType, setRepeatType] = useState<RepeatType>('none')
  const [customDays, setCustomDays] = useState<number[]>([])

  function toggleDay(day: number) {
    setCustomDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort(),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !dateTime) return

    onSubmit({
      title: title.trim(),
      category,
      dueAt: new Date(dateTime).toISOString(),
      repeat:
        repeatType === 'custom'
          ? { type: 'custom', daysOfWeek: customDays }
          : { type: repeatType },
    })

    setTitle('')
    setRepeatType('none')
    setCustomDays([])
    setDateTime(defaultDateTime())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="要做什麼事？"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      />

      <div className="flex flex-wrap gap-2">
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="none">不重複</option>
          <option value="daily">每日</option>
          <option value="weekly">每週</option>
          <option value="custom">自訂星期</option>
        </select>
      </div>

      {repeatType === 'custom' && (
        <div className="flex gap-1.5">
          {WEEKDAY_LABEL.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`h-7 w-7 rounded-full text-xs font-medium transition-colors ${
                customDays.includes(day)
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        >
          取消
        </button>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          新增
        </button>
      </div>
    </form>
  )
}
