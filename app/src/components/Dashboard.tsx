import type { ReactNode } from 'react'
import type { LevelInfo } from '../lib/gamification'
import { Header } from './Header'

/**
 * Shell for the home dashboard. Each life-assistant module (todo, later:
 * 記帳/生活數據/行事曆) renders as one card in `children` - drop a new
 * card component in here to add a module without touching this layout.
 */
export function Dashboard({ levelInfo, children }: { levelInfo: LevelInfo; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md">
        <Header levelInfo={levelInfo} />
        <main className="flex flex-col gap-4 px-4 pb-10">{children}</main>
      </div>
    </div>
  )
}
