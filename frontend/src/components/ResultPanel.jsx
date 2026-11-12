/**
 * Panel de resultados.
 *
 * Presenta el resultado de Atbash o el hash generado, además de los estados de
 * carga, error y vacío. El contenido cambia de formato según la herramienta:
 * texto con saltos de línea para Atbash y monoespaciado con cortes para hashes.
 */

import {
  AlertTriangle,
  Check,
  Copy,
  CornerDownLeft,
  Fingerprint,
  Loader2,
} from 'lucide-react'
import { buttonSecondary, focusRing, panel } from '../lib/ui'

/**
 * @param {{
 *   tool: object,
 *   mode: 'encrypt' | 'decrypt',
 *   result: string,
 *   loading: boolean,
 *   error: string,
 *   copied: boolean,
 *   onCopy: () => void,
 *   onUseAsInput: () => void,
 * }} props
 */
export default function ResultPanel({
  tool,
  mode,
  result,
  loading,
  error,
  copied,
  onCopy,
  onUseAsInput,
}) {
  const isCipher = tool.kind === 'cipher'

  // El modo de Atbash solo afecta al título: cifrar y descifrar comparten
  // exactamente la misma transformación.
  const title = isCipher
    ? mode === 'decrypt'
      ? 'Texto descifrado'
      : 'Texto cifrado'
    : 'Hash generado'

  const Icon = isCipher ? CornerDownLeft : Fingerprint

  return (
    <section
      aria-labelledby="titulo-resultado"
      className={`flex flex-col overflow-hidden ${panel}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <h2
              id="titulo-resultado"
              className="text-lg font-semibold text-navy"
            >
              {title}
            </h2>
          </div>

          {/* La etiqueta identifica el algoritmo activo; los hashes añaden
              además su tamaño en bits. */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-semibold text-accent">
              {tool.name}
            </span>
            {!isCipher && (
              <span className="rounded-full bg-cream px-2.5 py-0.5 font-medium text-muted">
                {tool.bits} bits
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Solo tiene sentido reutilizar un resultado de Atbash; un hash no
              se puede volver a procesar como entrada del mismo modo. */}
          {isCipher && result && !loading && (
            <button
              type="button"
              onClick={onUseAsInput}
              className={`${buttonSecondary} px-3 py-2 text-xs`}
            >
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
              Usar como entrada
            </button>
          )}

          {/* El botón cambia a "Copiado" durante 2 segundos. Se deshabilita
              mientras no hay resultado o hay una petición en curso. */}
          <button
            type="button"
            onClick={onCopy}
            disabled={!result || loading}
            className={`inline-flex min-h-10 min-w-24 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${focusRing} ${
              copied
                ? 'border-success/40 bg-success/10 text-success-deep'
                : 'border-line bg-cream-light text-navy hover:border-accent/40 hover:bg-accent-soft'
            }`}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5 py-4">
        {/* Los errores de red o validación se muestran antes del contenido. */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        {/* aria-live anuncia cambios de resultado, carga o error sin mover el
            foco del usuario. */}
        <div aria-live="polite" aria-atomic="true" className="flex-1">
          {loading ? (
            <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-sm text-muted">
              <Loader2
                className="size-6 animate-spin text-accent"
                aria-hidden="true"
              />
              Procesando en el servidor…
            </div>
          ) : result ? (
            isCipher ? (
              // Atbash puede producir textos largos: se conservan los saltos
              // de línea y se permite desplazamiento vertical.
              <div className="scrollbar-thin max-h-96 overflow-y-auto rounded-xl border border-line bg-white p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-navy">
                  {result}
                </p>
              </div>
            ) : (
              // Los hashes son cadenas largas sin espacios; break-all evita
              // que desborden el panel y el monoespaciado facilita leerlos.
              <div className="rounded-xl border border-line bg-white p-4">
                <p className="break-all font-mono text-[13px] leading-relaxed text-navy">
                  {result}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-2 text-[11px] text-muted">
                  <span>{result.length} caracteres hexadecimales</span>
                  <span
                    className="size-1 rounded-full bg-line"
                    aria-hidden="true"
                  />
                  <span>{tool.bits} bits</span>
                </div>
              </div>
            )
          ) : (
            // Estado inicial: explica qué hacer sin mostrar un espacio vacío.
            <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
              <Fingerprint className="size-8 text-steel" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-navy">
                  {isCipher
                    ? 'El resultado aparecerá aquí'
                    : 'Aún no se ha generado un hash'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {isCipher
                    ? 'Escribe un texto y pulsa Cifrar o Descifrar.'
                    : 'Escribe un texto y pulsa Generar hash.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
