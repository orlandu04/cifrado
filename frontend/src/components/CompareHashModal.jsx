/**
 * Modal comparativo de SHA-256 y SHA-512.
 *
 * Permite escribir un texto y generar ambos hashes en paralelo para verlos uno
 * al lado del otro. No verifica coincidencias ni guarda historial: su única
 * responsabilidad es mostrar los dos digests del mismo texto.
 */

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeftRight, Hash, Loader2, X } from 'lucide-react'
import { hashText } from '../api/client'
import { MAX_TEXT_LENGTH, sanitizeHashText } from '../lib/text'
import {
  buttonPrimary,
  buttonSecondary,
  focusRingInput,
} from '../lib/ui'

/**
 * El componente se monta únicamente cuando el modal está abierto, por lo que
 * el texto inicial y los resultados se crean desde cero en cada apertura.
 *
 * @param {{
 *   initialText: string,
 *   onClose: () => void,
 * }} props
 */
export default function CompareHashModal({ initialText, onClose }) {
  const dialogRef = useRef(null)
  const textareaRef = useRef(null)
  // Identifica la petición vigente. Si el usuario cierra el modal o cambia el
  // texto, una respuesta antigua no debe sobrescribir el estado actual.
  const requestId = useRef(0)
  // Evita notificar a App dos veces si el cierre nativo y el controlado
  // ocurren en el mismo cierre.
  const closeNotified = useRef(false)

  const [text, setText] = useState(() => sanitizeHashText(initialText))
  const [hashes, setHashes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // showModal coloca el diálogo en la capa superior, bloquea el resto de la
    // interfaz y devuelve el foco al cerrarse. La comprobación evita llamarlo
    // dos veces durante el doble montaje de efectos de StrictMode.
    if (!dialog.open) dialog.showModal()

    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frame)
      requestId.current += 1
    }
  }, [])

  // Evita que la página de fondo se desplace mientras el modal está abierto.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  /**
   * Aplica el mismo saneamiento que el editor y descarta resultados obsoletos.
   *
   * @param {string} value Contenido actual del campo.
   */
  const handleTextChange = (value) => {
    requestId.current += 1
    setText(sanitizeHashText(value))
    setHashes(null)
    setError('')
    setLoading(false)
  }

  /**
   * Genera SHA-256 y SHA-512 en paralelo para el texto actual.
   *
   * @param {React.FormEvent<HTMLFormElement>} [event]
   */
  const handleCompare = async (event) => {
    event?.preventDefault()
    if (text.length === 0 || loading) return

    const currentRequest = ++requestId.current
    setLoading(true)
    setHashes(null)
    setError('')

    try {
      const [sha256, sha512] = await Promise.all([
        hashText(text, 'sha256'),
        hashText(text, 'sha512'),
      ])

      if (currentRequest !== requestId.current) return

      setHashes({ sha256: sha256.hash, sha512: sha512.hash })
    } catch (requestError) {
      if (currentRequest !== requestId.current) return
      setError(requestError.message)
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }

  /**
   * Permite ejecutar la comparación con Ctrl+Enter o Cmd+Enter, igual que el
   * editor principal.
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event
   */
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      if (!loading && text.length > 0) handleCompare()
    }
  }

  /** Notifica el cierre una sola vez, sin importar qué ruta lo haya iniciado. */
  const notifyClose = () => {
    if (closeNotified.current) return
    closeNotified.current = true
    onClose()
  }

  /**
   * Cierra el diálogo nativo para que el navegador devuelva el foco al botón
   * que abrió el modal y notifica a App para que lo desmonte.
   */
  const closeDialog = () => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
    notifyClose()
  }

  /**
   * Respaldo para navegadores o versiones de React que cierren el diálogo de
   * forma nativa sin pasar por `closeDialog`.
   */
  const handleNativeClose = () => {
    notifyClose()
  }

  /**
   * Intercepta Escape para usar la misma ruta de cierre que los botones y el
   * fondo. Así App siempre recibe la notificación, incluso si el evento nativo
   * `close` no se propaga por el árbol de React.
   *
   * @param {React.SyntheticEvent<HTMLDialogElement>} event
   */
  const handleCancel = (event) => {
    event.preventDefault()
    closeDialog()
  }

  /**
   * Cierra el modal al pulsar el fondo. Los clics dentro del contenido tienen
   * como objetivo elementos hijos y no alcanzan este manejador.
   *
   * @param {React.MouseEvent<HTMLDialogElement>} event
   */
  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) closeDialog()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-comparar-hashes"
      aria-describedby="descripcion-comparar-hashes"
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onClick={handleBackdropClick}
      className="m-auto w-[92vw] max-w-5xl overflow-hidden rounded-2xl border border-line bg-cream-light p-0 text-navy shadow-soft"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <ArrowLeftRight className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="titulo-comparar-hashes"
                className="text-lg font-semibold text-navy"
              >
                Comparar SHA-256 y SHA-512
              </h2>
              <p
                id="descripcion-comparar-hashes"
                className="mt-1 text-xs text-muted"
              >
                Genera ambos hashes para el mismo texto, uno al lado del otro.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            aria-label="Cerrar comparación"
            className={`${buttonSecondary} size-10 shrink-0 p-0`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleCompare} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            <div>
              <label
                htmlFor="texto-comparar"
                className="text-sm font-medium text-navy"
              >
                Texto para comparar
              </label>
              <textarea
                id="texto-comparar"
                ref={textareaRef}
                value={text}
                onChange={(event) => handleTextChange(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={MAX_TEXT_LENGTH}
                rows={5}
                spellCheck={false}
                placeholder="Escribe solo letras A-Z, sin espacios ni acentos…"
                className={`scrollbar-thin mt-2 w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-navy placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 ${focusRingInput}`}
              />
              <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>{text.length.toLocaleString('es-ES')} caracteres</span>
                <span>Solo letras A-Z · Ctrl/Cmd + Enter para comparar</span>
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            )}

            <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
              {loading ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-line bg-white px-6 py-8 text-center text-sm text-muted">
                  <Loader2
                    className="size-6 animate-spin text-accent"
                    aria-hidden="true"
                  />
                  Generando ambos hashes…
                </div>
              ) : hashes ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'SHA-256', bits: 256, value: hashes.sha256 },
                    { label: 'SHA-512', bits: 512, value: hashes.sha512 },
                  ].map((item) => (
                    <section
                      key={item.label}
                      className="rounded-xl border border-line bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-navy">
                          {item.label}
                        </h3>
                        <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-medium text-muted">
                          {item.bits} bits
                        </span>
                      </div>
                      <p className="mt-3 break-all font-mono text-[12px] leading-relaxed text-navy">
                        {item.value}
                      </p>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-white/60 px-6 py-8 text-center">
                  <ArrowLeftRight
                    className="size-7 text-steel"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-navy">
                      Los dos hashes aparecerán aquí
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Escribe un texto y pulsa Generar hashes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={closeDialog}
              className={`${buttonSecondary} px-4 py-2.5 text-sm`}
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading || text.length === 0}
              className={`${buttonPrimary} px-4 py-2.5 text-sm`}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Hash className="size-4" aria-hidden="true" />
              )}
              Generar hashes
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  )
}
