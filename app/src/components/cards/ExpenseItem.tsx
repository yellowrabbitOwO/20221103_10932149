import { format } from 'date-fns'
import { formatCurrency } from '../../lib/expenses'
import type { Expense } from '../../types'
import { EXPENSE_CATEGORY_COLOR, EXPENSE_CATEGORY_LABEL } from '../../types'

export function ExpenseItem({
  expense,
  onDelete,
}: {
  expense: Expense
  onDelete: (id: string) => void
}) {
  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${EXPENSE_CATEGORY_COLOR[expense.category]}`} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-800">{expense.note || EXPENSE_CATEGORY_LABEL[expense.category]}</p>
        <p className="text-xs text-slate-400">
          {EXPENSE_CATEGORY_LABEL[expense.category]} · {format(new Date(expense.date), 'MM/dd')}
        </p>
      </div>

      <span className="shrink-0 text-sm font-medium text-slate-800">{formatCurrency(expense.amount)}</span>

      <button
        type="button"
        onClick={() => onDelete(expense.id)}
        aria-label="刪除記錄"
        className="shrink-0 text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <path d="M6 2h4a1 1 0 0 1 1 1v1h3v1.5H2V4h3V3a1 1 0 0 1 1-1zm-2 4h8l-.6 8.1a1 1 0 0 1-1 .9H5.6a1 1 0 0 1-1-.9L4 6z" />
        </svg>
      </button>
    </li>
  )
}
