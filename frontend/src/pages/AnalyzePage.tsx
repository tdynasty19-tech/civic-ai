import { useMemo, useState, useEffect, useRef } from 'react'
import { ArrowRight, FileText, Landmark, LoaderCircle, NotepadText } from 'lucide-react'
import { analyzeProblem, type AnalyzeResult } from '../services/analyzeService'
import { addHistoryItem } from '../services/historyService'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const appendVoiceText = (existing: string, incoming: string) => {
  const cleaned = incoming.trim()
  if (!cleaned) return existing
  if (!existing.trim()) return cleaned
  return `${existing.trimEnd()} ${cleaned}`
}

const normalizeListValue = (value: string | undefined | null) => value?.trim() || ''

type VoiceRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type VoiceRecognitionError = {
  error?: string
}

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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechNotice, setSpeechNotice] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState('')
  const recognitionRef = useRef<VoiceRecognitionLike | null>(null)
  const isListeningRef = useRef(false)

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

  const nextActions = useMemo(() => {
    if (!result) return [] as string[]

    const candidates = [
      ...(result.recommended_actions || []),
      ...(result.next_steps || []),
      ...(result.summary ? [result.summary] : []),
    ]
      .map((item) => normalizeListValue(item))
      .filter(Boolean)

    return Array.from(new Set(candidates)).slice(0, 5)
  }, [result])

  const speechText = useMemo(() => {
    if (!result) return ''

    const blocks = [
      result.summary,
      ...nextActions,
      ...(result.possible_rights || []).slice(0, 3),
    ]
      .map((item) => normalizeListValue(item))
      .filter(Boolean)

    return blocks.join('. ')
  }, [nextActions, result])

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setSpeechNotice('')
  }

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false)
      setSpeechNotice('Read Aloud is not supported by this browser.')
      return
    }

    if (!speechText) {
      setIsSpeaking(false)
      setSpeechNotice('No spoken summary is available for this result.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      setSpeechNotice('')
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setSpeechNotice('')
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeechNotice('')
    }

    window.speechSynthesis.speak(utterance)
  }

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
      const message = err && typeof err.message === 'string' ? err.message : ''
      const isUserFacingMessage = message && !/runtime|undefined|null|cannot read|is not a function/i.test(message)
      setError(isUserFacingMessage ? message : 'We could not complete the analysis right now. Please try again.')
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

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
        recognitionRef.current = null
      }
      isListeningRef.current = false
    }
  }, [])

  const stopVoiceInput = () => {
    const recognition = recognitionRef.current
    recognitionRef.current = null
    isListeningRef.current = false

    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // ignore
      }
    }
    setIsListening(false)
    setVoiceNotice('')
  }

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') {
      setVoiceNotice('Voice input is not supported by this browser. You can type your problem instead.')
      return
    }

    const SpeechRecognitionCtor = (window as typeof window & {
      SpeechRecognition?: new () => VoiceRecognitionLike
      webkitSpeechRecognition?: new () => VoiceRecognitionLike
    }).SpeechRecognition || (window as typeof window & {
      SpeechRecognition?: new () => VoiceRecognitionLike
      webkitSpeechRecognition?: new () => VoiceRecognitionLike
    }).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setVoiceNotice('Voice input is not supported by this browser. You can type your problem instead.')
      return
    }

    if (isListeningRef.current) {
      stopVoiceInput()
      return
    }

    if (recognitionRef.current) return

    const recognition = new SpeechRecognitionCtor()
    recognitionRef.current = recognition
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = true
    const processedFinalResults = new Set<number>()

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return

      isListeningRef.current = true
      setIsListening(true)
      setVoiceNotice('Listening... speak your problem.')
    }

    recognition.onresult = (event: any) => {
      if (recognitionRef.current !== recognition) return

      const finalTranscripts: string[] = []
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (!result?.isFinal || processedFinalResults.has(i)) continue

        const resultText = result[0]?.transcript?.trim() || ''
        processedFinalResults.add(i)
        if (resultText) finalTranscripts.push(resultText)
      }

      if (finalTranscripts.length > 0) {
        setProblem((currentProblem) => appendVoiceText(currentProblem, finalTranscripts.join(' ')))
        setVoiceNotice('')
      }
    }

    recognition.onerror = (event: VoiceRecognitionError) => {
      if (recognitionRef.current !== recognition) return

      recognitionRef.current = null
      isListeningRef.current = false
      setIsListening(false)
      const noticeByError: Record<string, string> = {
        'not-allowed': 'Microphone permission is required for voice input.',
        'service-not-allowed': 'Microphone permission is required for voice input.',
        'audio-capture': 'No microphone is available. Check your microphone and try again.',
        'no-speech': 'No speech detected. Please try again and speak clearly.',
        network: 'The speech service is unavailable. Please try again.',
      }
      setVoiceNotice(noticeByError[event.error || ''] || "Voice input couldn't be started. Please try again.")
    }

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return

      recognitionRef.current = null
      isListeningRef.current = false
      setIsListening(false)
      setVoiceNotice('')
    }

    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      isListeningRef.current = false
      setIsListening(false)
      setVoiceNotice("Voice input couldn't be started. Please try again.")
    }
  }

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

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label={isListening ? 'Stop microphone input' : 'Use speech input for the problem description'}
            aria-pressed={isListening}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isListening
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <span aria-hidden="true">{isListening ? '🔴' : '🎤'}</span>
            {isListening ? 'Listening... speak your problem.' : 'Speak'}
          </button>

          {voiceNotice && (
            <p role="status" aria-live="polite" className="text-sm text-amber-700">
              {voiceNotice}
            </p>
          )}
        </div>

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
                {error ? 'Try Again' : 'Analyze Situation'}
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
            {result && nextActions.length > 0 && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 md:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    What should I do next?
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={isSpeaking ? handleStopSpeech : handleReadAloud}
                      aria-label={isSpeaking ? 'Stop reading analysis aloud' : 'Read analysis aloud'}
                      aria-pressed={isSpeaking}
                      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      <span aria-hidden="true">{isSpeaking ? '🔊 Reading...' : '🔊 Read Aloud'}</span>
                    </button>

                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={handleStopSpeech}
                        aria-label="Stop reading analysis aloud"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <span aria-hidden="true">⏹</span>
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                <ol className="space-y-2 text-sm leading-6 text-slate-700">
                  {nextActions.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-2">
                      <span className="font-semibold text-indigo-600">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>

                <p className="mt-3 text-xs leading-5 text-slate-600">
                  {sectionData.disclaimer || 'These are general informational steps. Verify important details with official sources or a qualified professional.'}
                </p>

                {speechNotice && (
                  <p role="status" aria-live="polite" className="mt-3 text-xs text-amber-700">
                    {speechNotice}
                  </p>
                )}
              </div>
            )}

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
