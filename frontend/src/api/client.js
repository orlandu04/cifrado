const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { network = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.network = network
  }
}

function extractErrorMessage(payload) {
  if (!payload) return null

  const detail = payload.detail
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail) && detail.length > 0) {
    const message = detail[0]?.msg
    if (typeof message === 'string') {
      return message.replace(/^Value error,\s*/i, '')
    }
    return 'Revisa los datos ingresados.'
  }

  return null
}

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      { network: true },
    )
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = extractErrorMessage(payload)
    throw new ApiError(message ?? `Error del servidor (${response.status}).`)
  }

  return response.json()
}

export function checkHealth() {
  return request('/api/health')
}

export function atbashText(text, mode) {
  return request('/api/atbash', {
    method: 'POST',
    body: JSON.stringify({ text, mode }),
  })
}

export function hashText(text, algorithm) {
  return request('/api/hash', {
    method: 'POST',
    body: JSON.stringify({ text, algorithm }),
  })
}
