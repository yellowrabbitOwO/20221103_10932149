import { v4 as uuid } from 'uuid'
import type { Account } from '../types'
import { useLocalStorageState } from './useLocalStorageState'

export function useAccounts() {
  const [accounts, setAccounts] = useLocalStorageState<Account[]>('life-assistant:accounts', [])

  function addAccount(name: string, initialBalance: number) {
    const account: Account = {
      id: uuid(),
      name,
      balance: initialBalance,
      createdAt: new Date().toISOString(),
    }
    setAccounts((prev) => [...prev, account])
  }

  function adjustBalance(id: string, delta: number) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, balance: a.balance + delta } : a)))
  }

  return { accounts, addAccount, adjustBalance }
}
