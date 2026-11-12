import {
  Eraser,
  FileText,
  Hash,
  Loader2,
  LockKeyhole,
  Sparkles,
  UnlockKeyhole,
} from 'lucide-react'
import {
  buttonPrimary,
  buttonSecondary,
  focusRingInput,
  panel,
} from '../lib/ui'

const MAX_LENGTH = 100000

export default function EditorPanel({
  tool,
  text,
  onTextChange,
  onClear,
  onSample,
  onEncrypt,
  onDecrypt,
  onHash,
  loading,
}) {
  const isCipher = tool.kind === 'cipher'
  const isEmpty = text.length === 0
  const disabled = loading || isEmpty

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
        <label htmlFor="texto-entrada" className="sr-only">
          Texto de entrada
        </label>
        <textarea
          id="texto-entrada"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
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
        )}
      </footer>
    </section>
  )
}
