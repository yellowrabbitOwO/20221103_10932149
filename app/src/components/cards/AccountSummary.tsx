import { useState } from 'react'
import { formatCurrency } from '../../lib/expenses'
import type { Account } from '../../types'
import { AccountForm } from './AccountForm'

export function AccountSummary({
  accounts,
  onAddAccount,
}: {
  accounts: Account[]
  onAddAccount: (name: string, initialBalance: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">總資產</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalBalance)}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          {showForm ? '關閉' : '+ 新增帳戶'}
        </button>
      </div>

      {showForm && (
        <AccountForm
          onSubmit={(name, balance) => {
            onAddAccount(name, balance)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ul className="flex flex-col">
        {accounts.map((account) => (
          <li key={account.id} className="flex items-center justify-between px-1 py-1.5 text-sm">
            <span className="text-slate-600">{account.name}</span>
            <span className="font-medium text-slate-800">{formatCurrency(account.balance)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
