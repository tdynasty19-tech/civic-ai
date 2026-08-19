import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useLanguage, type Language } from '../contexts/LanguageContext'

const LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)

  const handleSelect = (l: Language) => {
    setLanguage(l)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
      >
        <Globe className="h-4 w-4" />
        {LABELS[language]}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-slate-200 bg-white shadow-lg">
          <ul className="py-1">
            <li>
              <button
                onClick={() => handleSelect('en')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSelect('hi')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                हिन्दी
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
