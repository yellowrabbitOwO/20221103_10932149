import { useState } from 'react'
import type { NewExpenseInput } from '../../hooks/useExpenses'
import { formatCurrency, isThisMonth, monthTotal, monthTotalsByCategory } from '../../lib/expenses'
import type { Expense } from '../../types'
import { EXPENSE_CATEGORY_COLOR, EXPENSE_CATEGORY_LABEL } from '../../types'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseItem } from './ExpenseItem'

export function ExpenseCard({
  expenses,
  onAdd,
  onDelete,
}: {
  expenses: Expense[]
  onAdd: (input: NewExpenseInput) => void
  onDelete: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)

  const now = new Date()
  const total = monthTotal(expenses, now)
  const breakdown = monthTotalsByCategory(expenses, now)
  const thisMonthExpenses = expenses
    .filter((e) => isThisMonth(e, now))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">記帳</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
        >
          {showForm ? '關閉' : '+ 記一筆'}
        </button>
      </div>

      {showForm && (
        <div className="mt-4">
          <ExpenseForm
            onSubmit={(input) => {
              onAdd(input)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs text-slate-400">本月支出</p>
        <p className="text-2xl font-semibold text-slate-900">{formatCurrency(total)}</p>
      </div>

      {breakdown.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {breakdown.map(({ category, total: categoryTotal }) => (
            <div key={category} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs text-slate-500">{EXPENSE_CATEGORY_LABEL[category]}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${EXPENSE_CATEGORY_COLOR[category]}`}
                  style={{ width: `${total > 0 ? (categoryTotal / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-slate-500">
                {formatCurrency(categoryTotal)}
              </span>
            </div>
          ))}
        </div>
      )}

      <ul className="mt-4 border-t border-slate-100 pt-2">
        {thisMonthExpenses.length === 0 && (
          <li className="py-8 text-center text-sm text-slate-400">本月還沒有記帳紀錄</li>
        )}
        {thisMonthExpenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  )
}
