import { ArrowLeftRight, Check, Fingerprint, ShieldCheck } from 'lucide-react'
import { TOOLS } from '../lib/tools'
import { focusRing } from '../lib/ui'

const ICONS = {
  atbash: ArrowLeftRight,
  sha256: Fingerprint,
  sha512: ShieldCheck,
}

export default function ToolSelector({ activeId, onChange }) {
  return (
    <section aria-labelledby="selector-herramientas">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="selector-herramientas"
          className="text-lg font-semibold text-navy"
        >
          Herramienta
        </h2>
        <p className="text-xs text-muted">
          Elige cómo quieres transformar tu texto
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="selector-herramientas"
        className="mt-3 grid gap-3 sm:grid-cols-3"
      >
        {TOOLS.map((tool) => {
          const active = tool.id === activeId
          const Icon = ICONS[tool.id] ?? ArrowLeftRight

          return (
            <button
              key={tool.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(tool.id)}
              className={`group flex h-full flex-col rounded-2xl border p-4 text-left transition duration-150 ${focusRing} ${
                active
                  ? 'border-accent bg-accent-soft shadow-soft'
                  : 'border-line bg-cream-light shadow-soft hover:border-accent/30 hover:bg-white'
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span
                  className={`flex size-9 items-center justify-center rounded-lg border ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-line bg-cream text-accent'
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  className={`flex size-5 items-center justify-center rounded-full border ${
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-line text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check className="size-3" />
                </span>
              </span>

              <span className="mt-3 text-base font-semibold leading-tight text-navy">
                {tool.name}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {tool.description}
              </span>
              <span
                className={`mt-3 block text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                {tool.tagline}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
