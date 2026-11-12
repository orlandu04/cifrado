import { ShieldCheck } from 'lucide-react'

const STATUS = {
  checking: {
    label: 'Comprobando API…',
    dot: 'bg-ochre',
    text: 'text-muted',
    border: 'border-line',
    background: 'bg-cream',
  },
  online: {
    label: 'API conectada',
    dot: 'bg-success',
    text: 'text-success-deep',
    border: 'border-success/30',
    background: 'bg-success/10',
  },
  offline: {
    label: 'API sin conexión',
    dot: 'bg-terracotta',
    text: 'text-terracotta',
    border: 'border-terracotta/30',
    background: 'bg-terracotta/10',
  },
}

export default function Header({ apiStatus }) {
  const status = STATUS[apiStatus] ?? STATUS.checking

  return (
    <header className="border-b border-line bg-cream-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/15">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight text-navy">
              Cifratab
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              Codifica, descifra y protege tus datos
            </p>
          </div>
        </div>

        <span
          role="status"
          aria-live="polite"
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status.border} ${status.background} ${status.text}`}
        >
          <span
            className={`size-1.5 rounded-full ${status.dot} ${
              apiStatus === 'checking' ? 'animate-pulse' : ''
            }`}
            aria-hidden="true"
          />
          {status.label}
        </span>
      </div>
    </header>
  )
}
