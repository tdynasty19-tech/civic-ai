export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="text-lg font-semibold text-slate-900">CivicAI</div>
          <p className="mt-1 text-sm text-slate-600">Making civic information easier to understand.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600" aria-label="Footer navigation">
          <a href="#" className="transition-colors hover:text-slate-900">
            About
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            Disclaimer
          </a>
        </nav>
      </div>
    </footer>
  )
}
