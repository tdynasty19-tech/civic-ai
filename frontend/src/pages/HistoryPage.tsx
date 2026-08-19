import { History as HistoryIcon, Trash, X, FileText, NotepadText, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import historyService, { type HistoryItem } from '../services/historyService'

const ICON_MAP: Record<string, any> = {
  analyze: NotepadText,
  draft: FileText,
  schemes: SlidersHorizontal,
}

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    setItems(historyService.getHistory())
  }, [])

  const handleDelete = (id: string) => {
    historyService.deleteHistoryItem(id)
    setItems(historyService.getHistory())
  }

  const handleClear = () => {
    if (!confirm('Clear all saved activity? This cannot be undone.')) return
    historyService.clearHistory()
    setItems([])
  }

  if (!items || items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex items-center gap-3 text-indigo-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <HistoryIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">Your activity</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Queries</h1>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <HistoryIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">No previous queries yet.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your saved civic questions and analysis will appear here once you start exploring the app.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 flex items-center justify-between gap-3 text-indigo-600">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <HistoryIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">Your activity</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 text-sm text-red-600">
            <Trash className="h-4 w-4" /> Clear all
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Queries</h1>

      <div className="mt-6 space-y-4">
        {items.map((it) => {
          const Icon = ICON_MAP[it.type] || HistoryIcon
          return (
            <article key={it.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{it.title}</h3>
                    <span className="text-xs text-slate-500">{new Date(it.timestamp).toLocaleString()}</span>
                  </div>
                  {it.description && <p className="mt-1 text-sm text-slate-600">{it.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // toggle details by showing an alert with sanitized payload
                    // Keep this minimal to avoid exposing sensitive fields
                    // Convert payload to a readable string
                    // eslint-disable-next-line no-alert
                    alert(JSON.stringify(it.payload || { type: it.type }, null, 2))
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 text-sm text-slate-700"
                >
                  View
                </button>

                <button onClick={() => handleDelete(it.id)} className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-2 text-sm text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
