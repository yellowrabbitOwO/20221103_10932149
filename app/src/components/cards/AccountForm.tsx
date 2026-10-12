import { useState } from 'react'
import { ACCOUNT_NAME_SUGGESTIONS } from '../../types'

export function AccountForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, initialBalance: number) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('0')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(balance)
    if (!name.trim() || Number.isNaN(parsed)) return

    onSubmit(name.trim(), parsed)
    setName('')
    setBalance('0')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex flex-wrap gap-1.5">
        {ACCOUNT_NAME_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setName(suggestion)}
            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="帳戶名稱"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          type="number"
          inputMode="decimal"
          step="1"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="目前金額"
          className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          新增帳戶
        </button>
      </div>
    </form>
  )
}
