import { v4 as uuid } from 'uuid'
import type { Expense, ExpenseCategory } from '../types'
import { useLocalStorageState } from './useLocalStorageState'

export interface NewExpenseInput {
  amount: number
  category: ExpenseCategory
  note?: string
  date: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorageState<Expense[]>('life-assistant:expenses', [])

  function addExpense(input: NewExpenseInput) {
    const expense: Expense = {
      id: uuid(),
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => [...prev, expense])
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  return { expenses, addExpense, deleteExpense }
}
