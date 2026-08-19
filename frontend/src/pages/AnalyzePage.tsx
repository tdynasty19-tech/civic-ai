import { useMemo, useState, useEffect } from 'react'
import { ArrowRight, FileText, Landmark, LoaderCircle, NotepadText } from 'lucide-react'
import { analyzeProblem, type AnalyzeResult } from '../services/analyzeService'
import { addHistoryItem } from '../services/historyService'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const resultSections = [
  'Situation Identified',
  'What This May Mean',
  'Recommended Actions',
  'Documents You May Need',
  'Next Steps',
  'Information Sources',
] as const

export function AnalyzePage() {
  const [problem, setProblem] = useState('')
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sectionData = useMemo(() => {
    if (!result) {
      return {
        category: '',
        summary: '',
        possible_rights: [],
        recommended_actions: [],
        required_documents: [],
        next_steps: [],
        sources: [],
        disclaimer: '',
      }
    }

    return result
  }, [result])

  const { language } = useLanguage()
  const location = useLocation()

  const handleAnalyze = async (inputProblem?: string) => {
    if (loading) return

    const raw = typeof inputProblem === 'string' ? inputProblem : problem
    const trimmed = raw.trim()

    if (!trimmed) {
      setError('Please describe your situation before analyzing.')
      setResult(null)
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await analyzeProblem(trimmed, language)
      setResult(response)

      // Record successful analysis in history (sanitized)
      try {
        addHistoryItem({
          type: 'analyze',
          title: response.category || (response.summary && response.summary.slice(0, 80)) || 'Analysis result',
          description: response.summary ? response.summary.slice(0, 300) : '',
          payload: {
            category: response.category,
            summary: response.summary,
            recommended_actions: (response.recommended_actions || []).slice(0, 5),
          },
        })
      } catch {
        // ignore history failures
      }
    } catch (err: any) {
      const message = err && err.message ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const navProblem = location && (location.state as any)?.problem
    if (typeof navProblem === 'string' && navProblem.trim()) {
      // Pre-fill and immediately analyze the provided problem
      setProblem(navProblem)
      void handleAnalyze(navProblem)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderList = (items: string[], fallback: string) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">{fallback}</p>
    }

    return (
      <ul className="space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  const renderNumberedList = (items: string[], fallback: string) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">{fallback}</p>
    }

    return (
      <ol className="space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2">
            <span className="font-semibold text-indigo-600">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 flex items-center gap-3 text-indigo-600">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <NotepadText className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.12em]">Rights Navigator</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Rights Navigator</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Describe your situation and CivicAI will help organize the information into clear next steps.
      </p>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label htmlFor="analyze-input" className="sr-only">
          Describe your situation
        </label>
        <textarea
          id="analyze-input"
          rows={8}
          value={problem}
          onChange={(event) => setProblem(event.target.value)}
          placeholder="Describe your situation in detail..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        />

        {error && (
          <div role="alert" aria-live="polite" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing your situation...
              </>
            ) : (
              <>
                Analyze Situation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300">
        <div className="mb-5 flex items-center gap-2 text-slate-700">
          <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Analysis Preview</h2>
        </div>

        {!result && !loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {resultSections.map((section) => (
              <div key={section} className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  {section}
                </div>
                <div className="min-h-20 rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-400">
                  Results will appear here.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Situation Identified
              </div>
              <p className="text-sm leading-6 text-slate-700">{sectionData.category || 'No category available.'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                What This May Mean
              </div>
              <p className="text-sm leading-6 text-slate-700">{sectionData.summary || 'No summary available yet.'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Possible Rights
              </div>
              {renderList(sectionData.possible_rights, 'No potential rights were returned.')}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Recommended Actions
              </div>
              {renderNumberedList(sectionData.recommended_actions, 'No recommended actions were returned.')}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Documents You May Need
              </div>
              {renderList(sectionData.required_documents, 'No document list was returned.')}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Next Steps
              </div>
              {renderNumberedList(sectionData.next_steps, 'No next steps were returned.')}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Information Sources
              </div>
              {renderList(
                sectionData.sources,
                'No specific sources were returned. Verify important information through official sources.',
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Disclaimer
              </div>
              <p className="text-sm leading-6 text-slate-700">{sectionData.disclaimer || 'No disclaimer provided.'}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
