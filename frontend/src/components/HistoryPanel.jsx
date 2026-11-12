/**
 * Historial de hashes de la sesión.
 *
 * Recibe únicamente las entradas del algoritmo activo, de modo que SHA-256 y
 * SHA-512 nunca se mezclan. El historial vive en memoria: al recargar la
 * página se pierde y no se envía nada a almacenamiento persistente.
 */

import { Check, Copy, History, Trash2 } from 'lucide-react'
import { HASH_LABELS } from '../lib/tools'
import { buttonSecondary, panel } from '../lib/ui'

/**
 * Formatea la marca de tiempo ISO en una hora local legible.
 *
 * @param {string} timestamp Fecha ISO generada al crear la entrada.
 * @returns {string} Hora en formato HH:MM:SS.
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * @param {{
 *   algorithm: 'sha256' | 'sha512',
 *   entries: Array<{ id: string, text: string, result: string, timestamp: string }>,
 *   copiedKey: string | null,
 *   onCopy: (value: string, key: string) => void,
 *   onClear: () => void,
 * }} props
 */
export default function HistoryPanel({
  algorithm,
  entries,
  copiedKey,
  onCopy,
  onClear,
}) {
  const algorithmLabel = HASH_LABELS[algorithm]

  return (
    <section aria-labelledby="titulo-historial" className={panel}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <History className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id="titulo-historial" className="text-lg font-semibold text-navy">
              Historial de hashes
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {algorithmLabel} · {entries.length}{' '}
              {entries.length === 1 ? 'registro' : 'registros'} en esta sesión
            </p>
          </div>
        </div>

        {/* El botón se deshabilita cuando no hay nada que borrar. Solo afecta
            al historial del algoritmo activo. */}
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className={`${buttonSecondary} px-3 py-2 text-xs`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Limpiar
        </button>
      </header>

      <div className="px-5 py-4">
        {entries.length === 0 ? (
          // Estado vacío con una explicación breve de cómo llenar la lista.
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/60 px-6 py-8 text-center">
            <History className="size-7 text-steel" aria-hidden="true" />
            <p className="text-sm font-medium text-navy">
              Aún no hay hashes en el historial
            </p>
            <p className="text-xs text-muted">
              Los hashes que generes aparecerán aquí.
            </p>
          </div>
        ) : (
          // Las entradas llegan con la más reciente primero desde App.
          <ul className="scrollbar-thin max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const copied = copiedKey === entry.id

              return (
                <li
                  key={entry.id}
                  className="rounded-xl border border-line bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        Texto original
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-navy">
                        {entry.text}
                      </p>
                    </div>

                    {/* El id de la entrada permite que solo este botón muestre
                        "Copiado" mientras el feedback está activo. */}
                    <button
                      type="button"
                      onClick={() => onCopy(entry.result, entry.id)}
                      aria-label={`Copiar hash de ${entry.text}`}
                      className={`${buttonSecondary} shrink-0 px-2.5 py-1.5 text-[11px] ${
                        copied
                          ? 'border-success/40 bg-success/10 text-success-deep'
                          : ''
                      }`}
                    >
                      {copied ? (
                        <Check className="size-3" aria-hidden="true" />
                      ) : (
                        <Copy className="size-3" aria-hidden="true" />
                      )}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>

                  {/* break-all evita que un hash de 128 caracteres desborde
                      la tarjeta en pantallas estrechas. */}
                  <div className="mt-3 rounded-lg border border-line bg-cream/60 p-3">
                    <p className="break-all font-mono text-[11px] leading-relaxed text-navy">
                      {entry.result}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                    <time dateTime={entry.timestamp}>
                      {formatTime(entry.timestamp)}
                    </time>
                    <span>{algorithmLabel}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
