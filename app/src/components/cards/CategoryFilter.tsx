import type { Category } from '../../types'
import { CATEGORY_LABEL } from '../../types'

const OPTIONS: Array<Category | 'all'> = ['all', 'work', 'life', 'other']

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | 'all'
  onChange: (value: Category | 'all') => void
}) {
  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === option
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {option === 'all' ? '全部' : CATEGORY_LABEL[option]}
        </button>
      ))}
    </div>
  )
}
