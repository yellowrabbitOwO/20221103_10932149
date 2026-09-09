import { format } from 'date-fns'
import { useState } from 'react'
import type { NewExpenseInput } from '../../hooks/useExpenses'
import type { ExpenseCategory } from '../../types'
import { EXPENSE_CATEGORY_LABEL } from '../../types'

export function ExpenseForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: NewExpenseInput) => void
  onCancel: () => void
}) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!parsed || parsed <= 0 || !date) return

    onSubmit({ amount: parsed, category, note: note.trim() || undefined, date })

    setAmount('')
    setNote('')
    setCategory('food')
    setDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex gap-2">
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="金額"
          className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註（選填）"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map((c) => (
            <option key={c} value={c}>
              {EXPENSE_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

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
          記一筆
        </button>
      </div>
    </form>
  )
}
