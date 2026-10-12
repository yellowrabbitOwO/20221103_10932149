import { useMemo } from 'react'
import { calcLevel } from '../lib/gamification'
import { useLocalStorageState } from './useLocalStorageState'

export function useGamification() {
  const [totalXp, setTotalXp] = useLocalStorageState<number>('life-assistant:xp', 0)

  const levelInfo = useMemo(() => calcLevel(totalXp), [totalXp])

  function addXp(amount: number) {
    setTotalXp((xp) => Math.max(0, xp + amount))
  }

  return { totalXp, levelInfo, addXp }
}
