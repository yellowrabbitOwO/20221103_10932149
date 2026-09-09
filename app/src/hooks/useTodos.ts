import { v4 as uuid } from 'uuid'
import { XP_PER_TODO } from '../lib/gamification'
import { nextOccurrence } from '../lib/todos'
import type { Category, RepeatRule, Todo } from '../types'
import { useLocalStorageState } from './useLocalStorageState'

export interface NewTodoInput {
  title: string
  category: Category
  dueAt: string
  repeat: RepeatRule
}

export function useTodos(onXpEarned: (amount: number) => void) {
  const [todos, setTodos] = useLocalStorageState<Todo[]>('life-assistant:todos', [])

  function addTodo(input: NewTodoInput) {
    const todo: Todo = {
      id: uuid(),
      title: input.title,
      category: input.category,
      dueAt: input.dueAt,
      repeat: input.repeat,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTodos((prev) => [...prev, todo])
  }

  function toggleComplete(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    // Note: uses `todos` from closure rather than a setState updater, since
    // awarding XP is a side effect and updater functions must stay pure
    // (React may invoke them more than once, e.g. under StrictMode).
    if (todo.completed) {
      setTodos(todos.map((t) => (t.id === id ? { ...t, completed: false, completedAt: undefined } : t)))
      return
    }

    onXpEarned(XP_PER_TODO)

    const updated: Todo =
      todo.repeat.type === 'none'
        ? { ...todo, completed: true, completedAt: new Date().toISOString() }
        : {
            ...todo,
            completed: false,
            completedAt: undefined,
            dueAt: nextOccurrence(new Date(todo.dueAt), todo.repeat).toISOString(),
          }

    setTodos(todos.map((t) => (t.id === id ? updated : t)))
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return { todos, addTodo, toggleComplete, deleteTodo }
}
