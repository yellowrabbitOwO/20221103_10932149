import { Dashboard } from './components/Dashboard'
import { ExpenseCard } from './components/cards/ExpenseCard'
import { TodoCard } from './components/cards/TodoCard'
import { useExpenses } from './hooks/useExpenses'
import { useGamification } from './hooks/useGamification'
import { useTodoReminders } from './hooks/useTodoReminders'
import { useTodos } from './hooks/useTodos'

function App() {
  const { levelInfo, addXp } = useGamification()
  const { todos, addTodo, toggleComplete, deleteTodo } = useTodos(addXp)
  const { expenses, addExpense, deleteExpense } = useExpenses()

  useTodoReminders(todos)

  return (
    <Dashboard levelInfo={levelInfo}>
      <TodoCard todos={todos} onAdd={addTodo} onToggle={toggleComplete} onDelete={deleteTodo} />
      <ExpenseCard expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} />
    </Dashboard>
  )
}

export default App
