import { AccountForm } from './AccountForm'

export function AccountOnboarding({
  onAddAccount,
}: {
  onAddAccount: (name: string, initialBalance: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <p className="text-sm text-slate-500">
        開始記帳前，先新增至少一個帳戶（例如銀行、現金、悠遊卡），並輸入目前的金額。
      </p>
      <AccountForm onSubmit={onAddAccount} />
    </div>
  )
}
