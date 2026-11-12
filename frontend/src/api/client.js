/**
 * Cliente HTTP de la API de Cifratab.
 *
 * Centraliza la URL base, el manejo de errores y las tres operaciones que usa
 * la interfaz: comprobar salud, aplicar Atbash y generar un hash. Así los
 * componentes no necesitan conocer detalles de fetch ni del formato de error
 * que devuelve FastAPI.
 */

// En desarrollo Vite redirige /api al backend mediante proxy. En producción se
// puede definir VITE_API_URL para apuntar a otro host. La barra final se quita
// para evitar dobles barras al concatenar las rutas.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/**
 * Error de la API con una marca opcional para distinguir fallos de red.
 *
 * La UI usa `network` para decidir si debe mostrar el aviso de backend
 * desconectado o mantener el estado de conexión.
 */
export class ApiError extends Error {
  constructor(message, { network = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.network = network
  }
}

/**
 * Extrae un mensaje legible del cuerpo de error de FastAPI.
 *
 * FastAPI puede devolver `detail` como cadena o como una lista de errores de
 * validación. En el segundo caso se usa el mensaje del primer error y se quita
 * el prefijo técnico "Value error," para mostrarlo directamente en la UI.
 *
 * @param {unknown} payload Cuerpo JSON ya parseado.
 * @returns {string | null} Mensaje listo para mostrar o null si no hay detalle.
 */
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

/**
 * Ejecuta una petición JSON contra la API y normaliza los errores.
 *
 * @param {string} path Ruta relativa, por ejemplo "/api/hash".
 * @param {RequestInit} [options] Opciones adicionales de fetch.
 * @returns {Promise<any>} Cuerpo JSON de una respuesta exitosa.
 * @throws {ApiError} Si falla la red, la respuesta no es OK o el JSON es inválido.
 */
async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // Un error aquí suele significar que el backend no está levantado o que
    // la URL configurada no es accesible.
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      { network: true },
    )
  }

  if (!response.ok) {
    // El cuerpo de error puede no ser JSON (por ejemplo, un proxy caído).
    const payload = await response.json().catch(() => null)
    const message = extractErrorMessage(payload)
    throw new ApiError(message ?? `Error del servidor (${response.status}).`)
  }

  return response.json()
}

/**
 * Comprueba si la API está disponible.
 *
 * @returns {Promise<{ status: string, service: string }>}
 */
export function checkHealth() {
  return request('/api/health')
}

/**
 * Aplica Atbash al texto indicado.
 *
 * @param {string} text Texto validado, solo letras A-Z.
 * @param {'encrypt' | 'decrypt'} mode Modo informativo para la interfaz.
 * @returns {Promise<{ result: string }>}
 */
export function atbashText(text, mode) {
  return request('/api/atbash', {
    method: 'POST',
    body: JSON.stringify({ text, mode }),
  })
}

/**
 * Genera un hash SHA-256 o SHA-512.
 *
 * @param {string} text Texto validado, solo letras A-Z.
 * @param {'sha256' | 'sha512'} algorithm Algoritmo solicitado.
 * @returns {Promise<{ algorithm: string, hash: string, bits: number }>}
 */
export function hashText(text, algorithm) {
  return request('/api/hash', {
    method: 'POST',
    body: JSON.stringify({ text, algorithm }),
  })
}
