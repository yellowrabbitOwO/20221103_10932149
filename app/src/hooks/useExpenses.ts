import { v4 as uuid } from 'uuid'
import type { Expense, ExpenseCategory } from '../types'
import { useLocalStorageState } from './useLocalStorageState'

export interface NewExpenseInput {
  amount: number
  category: ExpenseCategory
  note?: string
  date: string
  accountId: string
}

export function useExpenses(onAccountBalanceChange: (accountId: string, delta: number) => void) {
  const [expenses, setExpenses] = useLocalStorageState<Expense[]>('life-assistant:expenses', [])

  function addExpense(input: NewExpenseInput) {
    const expense: Expense = {
      id: uuid(),
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
      accountId: input.accountId,
      createdAt: new Date().toISOString(),
    }
    setExpenses([...expenses, expense])
    onAccountBalanceChange(input.accountId, -input.amount)
  }

  function deleteExpense(id: string) {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return

    setExpenses(expenses.filter((e) => e.id !== id))
    if (expense.accountId) {
      onAccountBalanceChange(expense.accountId, expense.amount)
    }
  }

  return { expenses, addExpense, deleteExpense }
}
