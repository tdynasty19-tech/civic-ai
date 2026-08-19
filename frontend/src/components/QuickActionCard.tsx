import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type QuickActionCardProps = {
  title: string
  description: string
  buttonLabel: string
  route: string
  icon: LucideIcon
}

export function QuickActionCard({
  title,
  description,
  buttonLabel,
  route,
  icon: Icon,
}: QuickActionCardProps) {
  const navigate = useNavigate()

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>

      <button
        type="button"
        onClick={() => navigate(route)}
        className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  )
}
