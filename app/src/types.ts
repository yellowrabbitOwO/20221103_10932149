export type Category = 'work' | 'life' | 'other'

export type RepeatType = 'none' | 'daily' | 'weekly' | 'custom'

export interface RepeatRule {
  type: RepeatType
  /** Only used when type === 'custom'. 0 = Sunday ... 6 = Saturday. */
  daysOfWeek?: number[]
}

export interface Todo {
  id: string
  title: string
  category: Category
  /** ISO datetime string of when this todo is due / should remind. */
  dueAt: string
  repeat: RepeatRule
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface GamificationState {
  totalXp: number
}

export const CATEGORY_LABEL: Record<Category, string> = {
  work: '工作',
  life: '生活',
  other: '其他',
}

export const CATEGORY_COLOR: Record<Category, string> = {
  work: 'bg-sky-500',
  life: 'bg-emerald-500',
  other: 'bg-violet-500',
}

export type ExpenseCategory = 'food' | 'transport' | 'shopping' | 'entertainment' | 'housing' | 'other'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  note?: string
  /** ISO date (yyyy-MM-dd) - the day the expense happened. */
  date: string
  createdAt: string
}

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  food: '餐飲',
  transport: '交通',
  shopping: '購物',
  entertainment: '娛樂',
  housing: '居家',
  other: '其他',
}

export const EXPENSE_CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  food: 'bg-orange-500',
  transport: 'bg-sky-500',
  shopping: 'bg-pink-500',
  entertainment: 'bg-violet-500',
  housing: 'bg-amber-500',
  other: 'bg-slate-400',
}
