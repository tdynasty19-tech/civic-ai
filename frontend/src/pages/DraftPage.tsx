import { FileText, Send, Copy, Download } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { DraftResult } from '../services/draftService'
import { generateDraft } from '../services/draftService'
import { addHistoryItem } from '../services/historyService'
import { useLanguage } from '../contexts/LanguageContext'

const SUPPORTED_TYPES = [
  'Complaint',
  'Formal Request',
  'RTI Application',
  'Grievance Letter',
  'Application Letter',
]

export function DraftPage() {
  const [documentType, setDocumentType] = useState<string>('Complaint')
  const [situation, setSituation] = useState<string>('')
  const [recipient, setRecipient] = useState<string>('')
  const [additionalDetails, setAdditionalDetails] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DraftResult | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const validate = (): string | null => {
    if (!documentType || !SUPPORTED_TYPES.includes(documentType)) {
      return 'Please select a valid document type.'
    }

    if (typeof recipient !== 'string') return 'Recipient must be a string.'
    if (!recipient.trim()) return 'Please provide a recipient.'

    if (typeof situation !== 'string' || !situation.trim()) return 'Please describe the situation.'
    if (situation.trim().length < 10) return 'Situation must be at least 10 characters long.'

    if (additionalDetails !== undefined && typeof additionalDetails !== 'string') return 'Additional details must be text.'

    return null
  }

  const { language } = useLanguage()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError(null)

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const data = await generateDraft({
        documentType,
        recipient: recipient.trim(),
        problem: situation.trim(),
        additionalDetails: additionalDetails.trim(),
        language,
      })

      setResult(data)
        // Record successful draft generation (sanitized)
        try {
          addHistoryItem({
            type: 'draft',
            title: data.title || 'Generated draft',
            description: data.subject || '',
            payload: {
              recipient: data.recipient,
              title: data.title,
              subject: data.subject,
              content_preview: data.content ? String(data.content).slice(0, 500) : '',
            },
          })
        } catch {
          // ignore
        }
    } catch (err: any) {
      const message = err && err.message ? err.message : 'Unable to generate draft right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const assembleFullText = (d: DraftResult): string => {
    return `${d.title}\n\nRecipient: ${d.recipient}\nSubject: ${d.subject}\n\n${d.content}\n\n${d.disclaimer}`
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(assembleFullText(result))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Unable to copy. Please select and copy the text manually.')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const text = assembleFullText(result)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'civicai-draft.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 flex items-center gap-3 text-indigo-600">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.12em]">Document drafting</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">AI Draft Generator</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5">
            <div>
              <label htmlFor="document-type" className="mb-2 block text-sm font-medium text-slate-700">
                Document type
              </label>
              <select
                id="document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="Complaint">Formal complaint</option>
                <option value="Formal Request">Request letter</option>
                <option value="RTI Application">RTI application</option>
                <option value="Grievance Letter">Grievance letter</option>
                <option value="Application Letter">Application letter</option>
              </select>
            </div>

            <div>
              <label htmlFor="draft-situation" className="mb-2 block text-sm font-medium text-slate-700">
                Situation / details
              </label>
              <textarea
                id="draft-situation"
                rows={6}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Summarize the issue and any important context..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="recipient" className="mb-2 block text-sm font-medium text-slate-700">
                Optional recipient
              </label>
              <input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                type="text"
                placeholder="e.g. Landlord, HR Manager, Authority"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="additional-details" className="mb-2 block text-sm font-medium text-slate-700">
                Additional details
              </label>
              <textarea
                id="additional-details"
                rows={5}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Add evidence, dates, amounts, or any other context..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-disabled={loading}
              className={`inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Generating your draft...' : 'Generate Draft'}
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>

            {result && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-disabled={copied}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  aria-disabled={!result}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {error && (
            <p role="alert" aria-live="polite" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Draft preview</h2>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-400 min-h-[200px]">
            {loading && <p className="text-slate-600">Generating your draft...</p>}

            {!loading && !result && !error && (
              <p>Your generated document will appear here.</p>
            )}

            {!loading && error && <p className="text-red-600">{error}</p>}

            {!loading && result && (
              <div className="prose max-w-none text-slate-800">
                <h3 className="text-lg font-semibold">{result.title}</h3>
                <p className="text-sm text-slate-600">Recipient: {result.recipient}</p>
                <p className="text-sm text-slate-600">Subject: {result.subject}</p>
                <div className="mt-3 whitespace-pre-wrap">{result.content}</div>
                <div className="mt-4 text-xs text-slate-500">{result.disclaimer}</div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Preview status</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {result ? 'Draft generated — review and edit before use.' : 'Draft output is generated in a later phase. The form shell is ready for content and layout.'}
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
