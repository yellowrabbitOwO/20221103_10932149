import { useEffect, useRef } from 'react'
import type { Todo } from '../types'

const MAX_TIMEOUT_MS = 2_147_483_647 // setTimeout's max delay (~24.8 days)

/**
 * Best-effort in-app reminders: while this tab is open, fires a browser
 * Notification when an incomplete todo's dueAt is reached.
 *
 * This cannot wake the device when the app is closed - once wrapped as a
 * native app (see README's Capacitor path), swap this for the Local
 * Notifications plugin using the same `dueAt` / `repeat` data.
 */
export function useTodoReminders(todos: Todo[]) {
  const notifiedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return
    }

    const timers = todos
      .filter((todo) => !todo.completed)
      .map((todo) => {
        const delay = new Date(todo.dueAt).getTime() - Date.now()
        if (delay < 0 || delay > MAX_TIMEOUT_MS) return null

        return setTimeout(() => {
          if (notifiedIds.current.has(todo.id)) return
          notifiedIds.current.add(todo.id)
          new Notification('生活助理提醒', { body: todo.title })
        }, delay)
      })
      .filter((t): t is ReturnType<typeof setTimeout> => t !== null)

    return () => timers.forEach(clearTimeout)
  }, [todos])
}
