import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { SchemeMatch } from '../services/schemeService'
import { findSchemes } from '../services/schemeService'
import { addHistoryItem } from '../services/historyService'
import { useLanguage } from '../contexts/LanguageContext'

export function SchemesPage() {
  const [state, setState] = useState<string>('')
  const [age, setAge] = useState<number | ''>('')
  const [education, setEducation] = useState<string>('')
  const [income, setIncome] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [occupation, setOccupation] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<SchemeMatch[] | null>(null)

  const { language } = useLanguage()

  const parseIncome = (value: string): number => {
    const cleaned = value.replace(/[^0-9.\-]/g, '')
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : NaN
  }

  const validate = (): string | null => {
    if (!state || !state.trim()) return 'Please enter your state.'
    if (age === '' || typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 120)
      return 'Please enter a valid age between 1 and 120.'
    if (!education || !education.trim()) return 'Please select your education level.'
    const inc = parseIncome(income || '')
    if (Number.isNaN(inc) || inc < 0) return 'Please enter a valid income (number >= 0).'
    if (!category || !category.trim()) return 'Please select your category.'
    if (!occupation || !occupation.trim()) return 'Please enter your occupation.'
    return null
  }

  const handleSearch = async () => {
    if (loading) return

    setError(null)
    setMatches(null)

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const inc = parseIncome(income)
      const profile = {
        state: state.trim(),
        age: Number(age),
        education: education.trim(),
        income: inc,
        category: category.trim(),
        occupation: occupation.trim(),
      }

      const res = await findSchemes(profile, language)
      setMatches(res)
      // Record successful scheme search
      try {
        addHistoryItem({
          type: 'schemes',
          title: res && res.length > 0 ? res[0].name : 'Scheme search',
          description: res && res.length > 0 ? res[0].description : 'No matches found',
          payload: {
            count: Array.isArray(res) ? res.length : 0,
            top_match: res && res.length > 0 ? { id: res[0].id, name: res[0].name } : null,
          },
        })
      } catch {
        // ignore
      }
    } catch (err: any) {
      const message = err && err.message ? err.message : 'Unable to find schemes right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 flex items-center gap-3 text-indigo-600">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.12em]">Government support</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Government Scheme Finder</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium text-slate-700">
                State
              </label>
              <input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                type="text"
                placeholder="e.g. Maharashtra"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="age" className="mb-2 block text-sm font-medium text-slate-700">
                Age
              </label>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                placeholder="25"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="education" className="mb-2 block text-sm font-medium text-slate-700">
                Education level
              </label>
              <select
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select education level
                </option>
                <option value="School">School</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Post Graduate</option>
              </select>
            </div>

            <div>
              <label htmlFor="income" className="mb-2 block text-sm font-medium text-slate-700">
                Annual family income
              </label>
              <input
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                type="text"
                placeholder="₹ 3,00,000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-slate-700">
                Occupation
              </label>
              <input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                type="text"
                placeholder="e.g. Student, Farmer"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              aria-busy={loading}
              aria-disabled={loading}
              className={`inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  Finding relevant schemes...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Find Opportunities
                  <Search className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {error && (
            <p role="alert" aria-live="polite" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-slate-700">
            <SlidersHorizontal className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Potential Matches</h2>
          </div>

          <div className="mt-5">
            {!matches && !loading && !error && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
                Enter your details to discover government schemes that may be relevant to you.
              </div>
            )}

            {matches && matches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
                <p>No potentially relevant schemes were found based on the information provided.</p>
                <p className="mt-2">Eligibility requirements can vary. Check official government sources for the latest information.</p>
              </div>
            )}

            {matches && matches.length > 0 && (
              <div className="grid gap-4">
                {matches.map((m) => (
                  <article key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-semibold">{m.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{m.description}</p>
                    <p className="text-sm text-slate-700 mt-3 font-medium">This scheme may be relevant based on the information provided.</p>
                    <p className="text-sm text-slate-600 mt-2 font-semibold">Why this may be relevant</p>
                    <p className="text-sm text-slate-600">{m.whyRelevant}</p>

                    {m.eligibility && m.eligibility.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold">Potential eligibility</p>
                        <ul className="list-disc list-inside text-sm text-slate-600">
                          {m.eligibility.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3">
                      <p className="text-sm font-semibold">Benefits</p>
                      <p className="text-sm text-slate-600">{m.benefits}</p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-semibold">Next steps</p>
                      <p className="text-sm text-slate-600">{m.nextSteps}</p>
                    </div>

                    {m.officialSource && (
                      <div className="mt-3">
                        <a href={m.officialSource} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 underline">
                          Official source
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
