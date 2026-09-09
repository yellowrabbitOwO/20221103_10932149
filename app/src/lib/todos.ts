import {
  addDays,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfWeek,
} from 'date-fns'
import type { RepeatRule, Todo } from '../types'

export function isOverdue(todo: Todo, now: Date): boolean {
  if (todo.completed) return false
  return new Date(todo.dueAt).getTime() < now.getTime()
}

export function isToday(todo: Todo, now: Date): boolean {
  return isSameDay(new Date(todo.dueAt), now)
}

export function isThisWeek(todo: Todo, now: Date): boolean {
  const due = new Date(todo.dueAt)
  return isWithinInterval(due, {
    start: startOfDay(now),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  })
}

/** Computes the next due date for a repeating todo, given it was last due at `from`. */
export function nextOccurrence(from: Date, repeat: RepeatRule): Date {
  if (repeat.type === 'daily') {
    return addDays(from, 1)
  }
  if (repeat.type === 'weekly') {
    return addDays(from, 7)
  }
  if (repeat.type === 'custom' && repeat.daysOfWeek && repeat.daysOfWeek.length > 0) {
    let candidate = addDays(from, 1)
    for (let i = 0; i < 7; i++) {
      if (repeat.daysOfWeek.includes(candidate.getDay())) {
        return candidate
      }
      candidate = addDays(candidate, 1)
    }
  }
  return from
}
