import { ArrowRight, FileText, Landmark, Scale } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const quickHighlights = [
  { icon: Scale, label: 'Rights guidance' },
  { icon: FileText, label: 'Drafts' },
  { icon: Landmark, label: 'Schemes' },
]

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">
            Civic support, simplified
          </div>

          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Understand Your Rights. Know Your Next Step.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            CivicAI helps you turn complicated civic and legal problems into clear, actionable steps.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <label htmlFor="problem-input" className="sr-only">
              Describe your problem
            </label>
            <textarea
              id="problem-input"
              rows={5}
              placeholder="Describe your problem in your own words..."
              className="w-full resize-none border-0 bg-transparent px-2 py-2 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('problem-input') as HTMLTextAreaElement | null
                const text = el ? el.value.trim() : ''
                if (text) {
                  navigate('/analyze', { state: { problem: text } })
                } else {
                  navigate('/analyze')
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Analyze My Problem
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-4 max-w-lg text-xs leading-5 text-slate-500">
            AI-generated guidance for informational purposes. Verify important information with official
            sources or a qualified professional.
          </p>
        </div>

        <aside className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Guided support
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Start here</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {quickHighlights.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Ready</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
