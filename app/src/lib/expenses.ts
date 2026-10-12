import { isSameMonth } from 'date-fns'
import type { Expense, ExpenseCategory } from '../types'

export function formatCurrency(amount: number): string {
  return `NT$${amount.toLocaleString('zh-TW')}`
}

export function isThisMonth(expense: Expense, now: Date): boolean {
  return isSameMonth(new Date(expense.date), now)
}

export function monthTotal(expenses: Expense[], now: Date): number {
  return expenses
    .filter((e) => isThisMonth(e, now))
    .reduce((sum, e) => sum + e.amount, 0)
}

export interface CategoryTotal {
  category: ExpenseCategory
  total: number
}

/** Category totals for this month, sorted highest spend first. Zero-total categories are omitted. */
export function monthTotalsByCategory(expenses: Expense[], now: Date): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>()
  for (const expense of expenses) {
    if (!isThisMonth(expense, now)) continue
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}
