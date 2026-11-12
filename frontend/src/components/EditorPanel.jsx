/**
 * Panel de entrada de texto.
 *
 * Adapta el placeholder y los botones según la herramienta seleccionada:
 * Atbash muestra Cifrar/Descifrar y los hashes muestran Comparar/Generar hash.
 * También aplica el límite de longitud y el atajo Ctrl/Cmd+Enter.
 */

import {
  ArrowLeftRight,
  Eraser,
  FileText,
  Hash,
  Loader2,
  LockKeyhole,
  Sparkles,
  UnlockKeyhole,
} from 'lucide-react'
import { MAX_TEXT_LENGTH } from '../lib/text'
import {
  buttonPrimary,
  buttonSecondary,
  focusRingInput,
  panel,
} from '../lib/ui'

/**
 * @param {{
 *   tool: object,
 *   text: string,
 *   onTextChange: (value: string) => void,
 *   onClear: () => void,
 *   onSample: () => void,
 *   onEncrypt: () => void,
 *   onDecrypt: () => void,
 *   onHash: () => void,
 *   onCompare: () => void,
 *   loading: boolean,
 * }} props
 */
export default function EditorPanel({
  tool,
  text,
  onTextChange,
  onClear,
  onSample,
  onEncrypt,
  onDecrypt,
  onHash,
  onCompare,
  loading,
}) {
  const isCipher = tool.kind === 'cipher'
  const isEmpty = text.length === 0
  // Evita enviar solicitudes duplicadas y acciones sobre un editor vacío.
  const disabled = loading || isEmpty

  /**
   * Ejecuta la acción principal con Ctrl+Enter (Windows/Linux) o Cmd+Enter
   * (macOS). En Atbash se cifra; en herramientas de hash se genera el hash.
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event
   */
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      if (disabled) return
      if (isCipher) {
        onEncrypt()
      } else {
        onHash()
      }
    }
  }

  return (
    <section className={`flex flex-col overflow-hidden ${panel}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FileText className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-navy">Texto de entrada</h2>
            <p className="mt-0.5 text-xs text-muted">
              Escribe el texto que deseas procesar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Los botones auxiliares no envían datos: solo preparan el editor. */}
          <button
            type="button"
            onClick={onSample}
            className={`${buttonSecondary} px-3.5 py-2 text-xs`}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Ejemplo
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={loading || isEmpty}
            className={`${buttonSecondary} px-3.5 py-2 text-xs`}
          >
            <Eraser className="size-3.5" aria-hidden="true" />
            Limpiar
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* La etiqueta es visualmente oculta porque el título del panel ya
            describe el campo, pero sigue asociada para lectores de pantalla. */}
        <label htmlFor="texto-entrada" className="sr-only">
          Texto de entrada
        </label>
        <textarea
          id="texto-entrada"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_TEXT_LENGTH}
          rows={12}
          spellCheck={false}
          placeholder={tool.placeholder}
          className={`scrollbar-thin w-full resize-y rounded-xl border border-line bg-white px-4 py-3.5 text-sm leading-relaxed text-navy placeholder:text-muted ${focusRingInput}`}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>{text.length.toLocaleString('es-ES')} caracteres</span>
          <span>Solo letras A-Z · sin Ñ, espacios, números ni acentos</span>
        </div>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
        {isCipher ? (
          <>
            {/* Atbash es simétrico: ambos botones llaman al mismo endpoint,
                pero el modo permite describir la acción en el resultado. */}
            <button
              type="button"
              onClick={onDecrypt}
              disabled={disabled}
              className={`${buttonSecondary} px-4 py-2.5 text-sm`}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UnlockKeyhole className="size-4" aria-hidden="true" />
              )}
              Descifrar
            </button>
            <button
              type="button"
              onClick={onEncrypt}
              disabled={disabled}
              className={`${buttonPrimary} px-4 py-2.5 text-sm`}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LockKeyhole className="size-4" aria-hidden="true" />
              )}
              Cifrar
            </button>
          </>
        ) : (
          <>
            {/* El comparador tiene su propio campo dentro del modal, por eso
                sigue disponible aunque el editor esté vacío. */}
            <button
              type="button"
              onClick={onCompare}
              className={`${buttonSecondary} px-4 py-2.5 text-sm`}
            >
              <ArrowLeftRight className="size-4" aria-hidden="true" />
              Comparar
            </button>
            <button
              type="button"
              onClick={onHash}
              disabled={disabled}
              className={`${buttonPrimary} px-4 py-2.5 text-sm`}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Hash className="size-4" aria-hidden="true" />
              )}
              Generar hash
            </button>
          </>
        )}
      </footer>
    </section>
  )
}
