import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ExampleProblemProps = {
  text: string
}

export function ExampleProblem({ text }: ExampleProblemProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/analyze')}
      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
    >
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{text}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-indigo-600" aria-hidden="true" />
    </button>
  )
}
