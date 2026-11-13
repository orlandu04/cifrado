/**
 * Catálogo de herramientas disponibles en la interfaz.
 *
 * Cada entrada describe tanto la presentación (nombre, descripción, icono
 * asociado en ToolSelector) como los datos que necesita App para ejecutar la
 * operación y adaptar el editor y el panel de resultados.
 */

export const TOOLS = [
  {
    // Atbash no genera un hash: transforma letras y permite cifrar o descifrar.
    id: 'atbash',
    name: 'Atbash',
    tagline: '26 letras · simétrico',
    description: 'Sustituye cada letra A-Z por su opuesta en el alfabeto.',
    kind: 'cipher',
    placeholder: 'Escribe solo letras A-Z, sin espacios ni acentos…',
    sample: 'CIFRATAB',
  },
  {
    // La misma entrada de texto produce un hash hexadecimal de 64 caracteres.
    id: 'sha256',
    name: 'SHA-256',
    tagline: '256 bits · 64 caracteres',
    description: 'Huella digital compacta y ampliamente utilizada.',
    kind: 'hash',
    algorithm: 'sha256',
    bits: 256,
    placeholder: 'Escribe solo letras, sin espacios ni acentos…',
    sample: 'LAPRIVACIDADESUNDERECHO',
  },
  {
    // SHA-512 duplica la longitud del digest y se identifica por su algoritmo.
    id: 'sha512',
    name: 'SHA-512',
    tagline: '512 bits · 128 caracteres',
    description: 'Digest más largo para una mayor resistencia.',
    kind: 'hash',
    algorithm: 'sha512',
    bits: 512,
    placeholder: 'Escribe solo letras, sin espacios ni acentos…',
    sample: 'LAPRIVACIDADESUNDERECHO',
  },
]

// Índice por id para resolver la herramienta activa sin recorrer el arreglo.
export const TOOL_MAP = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]))

// Nombres legibles usados en el historial y en las etiquetas de resultado.
export const HASH_LABELS = {
  sha256: 'SHA-256',
  sha512: 'SHA-512',
}
