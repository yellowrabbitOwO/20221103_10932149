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
