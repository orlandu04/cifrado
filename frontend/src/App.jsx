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

const NON_LETTERS = /[^A-Za-z]/g

function sanitizeAtbash(value) {
  return value.replace(NON_LETTERS, '').toUpperCase()
}

function sanitizeHashText(value) {
  return value.replace(NON_LETTERS, '')
}

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
  const [toolId, setToolId] = useState('atbash')
  const [text, setText] = useState('')
  const [mode, setMode] = useState('encrypt')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)
  const [histories, setHistories] = useState({ sha256: [], sha512: [] })
  const [apiStatus, setApiStatus] = useState('checking')

  const copiedTimer = useRef(null)
  const tool = TOOL_MAP[toolId]

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

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    }
  }, [])

  const resetOutput = () => {
    setResult('')
    setError('')
    setCopiedKey(null)
  }

  const handleToolChange = (nextToolId) => {
    if (nextToolId === toolId) return
    const nextTool = TOOL_MAP[nextToolId]

    setToolId(nextToolId)

    if (nextTool.kind === 'cipher') {
      setText((previous) => sanitizeAtbash(previous))
    } else {
      setText((previous) => sanitizeHashText(previous))
    }

    resetOutput()
  }

  const handleTextChange = (value) => {
    setText(
      tool.kind === 'cipher' ? sanitizeAtbash(value) : sanitizeHashText(value),
    )
  }

  const handleSample = () => {
    setText(tool.sample)
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

  const handleClear = () => {
    setText('')
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

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
      setError(requestError.message)
      setApiStatus(requestError.network ? 'offline' : 'online')
    } finally {
      setLoading(false)
    }
  }

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

  const handleClearHistory = () => {
    setHistories((previous) => ({ ...previous, [tool.algorithm]: [] }))
  }

  const handleCopy = async (value, key) => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setError('No se pudo copiar al portapapeles en este navegador.')
    }
  }

  const handleUseAsInput = () => {
    if (!result) return
    setText(result)
    resetOutput()
    document.getElementById('texto-entrada')?.focus()
  }

  const history = tool.kind === 'hash' ? histories[tool.algorithm] ?? [] : []

  return (
    <div className="flex min-h-dvh flex-col">
      <Header apiStatus={apiStatus} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <ToolSelector activeId={toolId} onChange={handleToolChange} />

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
