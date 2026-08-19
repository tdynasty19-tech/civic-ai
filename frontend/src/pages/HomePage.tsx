import { FileText, Landmark, Scale } from 'lucide-react'
import { QuickActionCard } from '../components/QuickActionCard'
import { ExampleProblem } from '../components/ExampleProblem'
import { Hero } from '../components/Hero'

const quickActions = [
  {
    title: 'Rights Navigator',
    description: 'Understand your situation and discover practical next steps.',
    buttonLabel: 'Explore',
    route: '/analyze',
    icon: Scale,
  },
  {
    title: 'Draft Generator',
    description: 'Turn your situation into a clear formal request or complaint.',
    buttonLabel: 'Create Draft',
    route: '/draft',
    icon: FileText,
  },
  {
    title: 'Scheme Finder',
    description: 'Discover government schemes and services that may be relevant to you.',
    buttonLabel: 'Find Schemes',
    route: '/schemes',
    icon: Landmark,
  },
]

const examples = [
  'My landlord hasn\'t returned my security deposit.',
  'My employer hasn\'t paid my salary.',
  'I want to file an RTI application.',
  'Which government scholarships might I qualify for?',
]

export function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Quick access</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Explore key tools</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Not sure where to start?</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {examples.map((example) => (
              <ExampleProblem key={example} text={example} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
