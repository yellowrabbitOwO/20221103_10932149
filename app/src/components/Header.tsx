import type { LevelInfo } from '../lib/gamification'

export function Header({ levelInfo }: { levelInfo: LevelInfo }) {
  const progress = Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100))

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">生活助理</h1>
        <p className="text-sm text-slate-400">今天也一起完成一些事吧</p>
      </div>

      <div className="flex min-w-[140px] flex-col items-end gap-1">
        <span className="text-sm font-medium text-slate-600">Lv.{levelInfo.level}</span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {levelInfo.xpIntoLevel} / {levelInfo.xpForNextLevel} XP
        </span>
      </div>
    </header>
  )
}
