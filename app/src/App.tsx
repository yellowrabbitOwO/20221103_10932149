import { Dashboard } from './components/Dashboard'
import { TodoCard } from './components/cards/TodoCard'
import { useGamification } from './hooks/useGamification'
import { useTodoReminders } from './hooks/useTodoReminders'
import { useTodos } from './hooks/useTodos'

function App() {
  const { levelInfo, addXp } = useGamification()
  const { todos, addTodo, toggleComplete, deleteTodo } = useTodos(addXp)

  useTodoReminders(todos)

  return (
    <Dashboard levelInfo={levelInfo}>
      <TodoCard todos={todos} onAdd={addTodo} onToggle={toggleComplete} onDelete={deleteTodo} />
    </Dashboard>
  )
}

export default App
