/**
 * Componente raíz de Cifratab.
 *
 * Mantiene el estado compartido entre el selector, el editor y los paneles de
 * resultado/historial. La lógica de red vive en `api/client.js`; aquí solo se
 * orquesta la interacción, el saneamiento de entrada y la presentación.
 */

import { useEffect, useRef, useState } from 'react'
import { ServerCrash } from 'lucide-react'
import EditorPanel from './components/EditorPanel'
import Footer from './components/Footer'
import Header from './components/Header'
import HistoryPanel from './components/HistoryPanel'
import ResultPanel from './components/ResultPanel'
import ToolSelector from './components/ToolSelector'
import { atbashText, checkHealth, hashText } from './api/client'
import { TOOL_MAP } from './lib/tools'

// Los servicios solo aceptan letras ASCII. Se elimina cualquier otro carácter
// mientras el usuario escribe para que la API no reciba entradas inválidas.
const NON_LETTERS = /[^A-Za-z]/g

/**
 * Sanea el texto de Atbash: quita caracteres no alfabéticos y normaliza a
 * mayúsculas, que es el formato que devuelve el backend.
 *
 * @param {string} value Texto escrito por el usuario.
 * @returns {string} Texto con solo letras A-Z.
 */
function sanitizeAtbash(value) {
  return value.replace(NON_LETTERS, '').toUpperCase()
}

/**
 * Sanea el texto para hashing. Se conserva la capitalización original porque
 * mayúsculas y minúsculas producen hashes distintos.
 *
 * @param {string} value Texto escrito por el usuario.
 * @returns {string} Texto con solo letras A-Z/a-z.
 */
function sanitizeHashText(value) {
  return value.replace(NON_LETTERS, '')
}

/**
 * Genera un identificador único para una entrada del historial.
 *
 * Se usa `crypto.randomUUID` cuando está disponible. El fallback combina la
 * marca de tiempo con un fragmento aleatorio para navegadores antiguos o
 * contextos no seguros donde randomUUID no existe.
 *
 * @returns {string} Identificador único.
 */
function createHistoryId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function App() {
  // Herramienta activa: determina validaciones, textos y paneles visibles.
  const [toolId, setToolId] = useState('atbash')
  const [text, setText] = useState('')
  // `mode` solo cambia el título del resultado de Atbash; el cifrado es simétrico.
  const [mode, setMode] = useState('encrypt')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Puede ser "result" o el id de una entrada del historial. Permite mostrar
  // el estado "Copiado" solo en el botón que se pulsó.
  const [copiedKey, setCopiedKey] = useState(null)
  // Historial separado por algoritmo para no mezclar SHA-256 con SHA-512.
  // Cada entrada tiene la forma { id, text, result, timestamp }.
  const [histories, setHistories] = useState({ sha256: [], sha512: [] })
  // checking | online | offline; se refleja en el indicador del header.
  const [apiStatus, setApiStatus] = useState('checking')

  // Timer del feedback de copiado. Se guarda en una ref para poder cancelarlo
  // al desmontar o al copiar otro valor antes de que termine.
  const copiedTimer = useRef(null)
  const tool = TOOL_MAP[toolId]

  // Comprobación inicial de disponibilidad de la API. La bandera `active`
  // evita actualizar estado si el componente se desmonta durante la petición.
  useEffect(() => {
    let active = true

    checkHealth()
      .then(() => {
        if (active) setApiStatus('online')
      })
      .catch(() => {
        if (active) setApiStatus('offline')
      })

    return () => {
      active = false
    }
  }, [])

  // Limpieza del timer pendiente al desmontar el componente.
  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    }
  }, [])

  /** Borra resultado, error y feedback de copiado sin tocar el historial. */
  const resetOutput = () => {
    setResult('')
    setError('')
    setCopiedKey(null)
  }

  /**
   * Cambia de herramienta, adapta el texto existente y limpia la salida.
   * El historial se conserva porque cada algoritmo tiene su propia lista.
   *
   * @param {string} nextToolId Id de la herramienta seleccionada.
   */
  const handleToolChange = (nextToolId) => {
    if (nextToolId === toolId) return
    const nextTool = TOOL_MAP[nextToolId]

    setToolId(nextToolId)

    // Al pasar de un hash a Atbash (o viceversa) se aplica el saneamiento
    // correspondiente para que el texto siga siendo válido.
    if (nextTool.kind === 'cipher') {
      setText((previous) => sanitizeAtbash(previous))
    } else {
      setText((previous) => sanitizeHashText(previous))
    }

    resetOutput()
  }

  /**
   * Aplica el saneamiento correcto mientras el usuario escribe.
   *
   * @param {string} value Contenido actual del textarea.
   */
  const handleTextChange = (value) => {
    setText(
      tool.kind === 'cipher' ? sanitizeAtbash(value) : sanitizeHashText(value),
    )
  }

  /** Inserta el ejemplo de la herramienta activa y enfoca el editor. */
  const handleSample = () => {
    setText(tool.sample)
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

  /** Vacía el editor, limpia la salida y devuelve el foco al textarea. */
  const handleClear = () => {
    setText('')
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

  /**
   * Ejecuta Atbash en el modo indicado.
   *
   * @param {'encrypt' | 'decrypt'} nextMode Acción que describe la interfaz.
   */
  const runAtbash = async (nextMode) => {
    const input = text
    if (input.length === 0) return

    setMode(nextMode)
    setResult('')
    setError('')
    setCopiedKey(null)
    setLoading(true)

    try {
      const data = await atbashText(input, nextMode)
      setResult(data.result)
      setApiStatus('online')
    } catch (requestError) {
      // `network` distingue un backend caído de un error de validación.
      setError(requestError.message)
      setApiStatus(requestError.network ? 'offline' : 'online')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Genera el hash de la herramienta activa y lo agrega al historial.
   *
   * El nuevo registro se coloca al inicio para mostrar primero lo más reciente.
   * No se reemplazan entradas anteriores y solo se modifica la lista del
   * algoritmo utilizado.
   */
  const runHash = async () => {
    const input = text
    if (input.length === 0) return

    setResult('')
    setError('')
    setCopiedKey(null)
    setLoading(true)

    try {
      const data = await hashText(input, tool.algorithm)
      setResult(data.hash)
      setHistories((previous) => ({
        ...previous,
        [tool.algorithm]: [
          {
            id: createHistoryId(),
            text: input,
            result: data.hash,
            timestamp: new Date().toISOString(),
          },
          ...previous[tool.algorithm],
        ],
      }))
      setApiStatus('online')
    } catch (requestError) {
      setError(requestError.message)
      setApiStatus(requestError.network ? 'offline' : 'online')
    } finally {
      setLoading(false)
    }
  }

  /** Vacía únicamente el historial del algoritmo activo. */
  const handleClearHistory = () => {
    setHistories((previous) => ({ ...previous, [tool.algorithm]: [] }))
  }

  /**
   * Copia un valor al portapapeles y muestra feedback temporal.
   *
   * @param {string} value Texto a copiar (resultado o hash del historial).
   * @param {string} key "result" o el id de la entrada copiada.
   */
  const handleCopy = async (value, key) => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      // Reinicia el temporizador si se copia otro valor antes de los 2 s.
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setError('No se pudo copiar al portapapeles en este navegador.')
    }
  }

  /** Coloca el resultado de Atbash como nueva entrada editable. */
  const handleUseAsInput = () => {
    if (!result) return
    setText(result)
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

  // Atbash no genera historial; los hashes usan la lista de su algoritmo.
  const history = tool.kind === 'hash' ? histories[tool.algorithm] ?? [] : []

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Cabecera con marca y estado de conexión de la API. */}
      <Header apiStatus={apiStatus} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {/* Selector de herramienta: Atbash, SHA-256 o SHA-512. */}
        <ToolSelector activeId={toolId} onChange={handleToolChange} />

        {/* Aviso accionable cuando la comprobación inicial detecta un fallo. */}
        {apiStatus === 'offline' && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-xl border border-terracotta/30 bg-terracotta/10 px-5 py-4 text-sm text-ink shadow-soft"
          >
            <ServerCrash
              className="mt-0.5 size-5 shrink-0 text-terracotta"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-navy">
                No se pudo conectar con la API
              </p>
              <p className="mt-1 text-muted">
                Inicia el backend desde la carpeta{' '}
                <code className="rounded border border-line bg-cream px-1.5 py-0.5 font-mono text-xs text-navy">
                  backend
                </code>{' '}
                con{' '}
                <code className="rounded border border-line bg-cream px-1.5 py-0.5 font-mono text-xs text-navy">
                  uvicorn app.main:app --reload --port 8000
                </code>
                .
              </p>
            </div>
          </div>
        )}

        {/* Dos columnas en escritorio: entrada a la izquierda, salida a la
            derecha. En móvil se apilan en el mismo orden. */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <EditorPanel
            tool={tool}
            text={text}
            onTextChange={handleTextChange}
            onClear={handleClear}
            onSample={handleSample}
            onEncrypt={() => runAtbash('encrypt')}
            onDecrypt={() => runAtbash('decrypt')}
            onHash={runHash}
            loading={loading}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <ResultPanel
              tool={tool}
              mode={mode}
              result={result}
              loading={loading}
              error={error}
              copied={copiedKey === 'result'}
              onCopy={() => handleCopy(result, 'result')}
              onUseAsInput={handleUseAsInput}
            />

            {/* El historial solo existe para herramientas de tipo hash. */}
            {tool.kind === 'hash' && (
              <HistoryPanel
                algorithm={tool.algorithm}
                entries={history}
                copiedKey={copiedKey}
                onCopy={handleCopy}
                onClear={handleClearHistory}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
