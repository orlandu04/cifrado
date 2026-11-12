export const TOOLS = [
  {
    id: 'atbash',
    name: 'Atbash',
    tagline: '26 letras · simétrico',
    description: 'Sustituye cada letra A-Z por su opuesta en el alfabeto.',
    kind: 'cipher',
    placeholder: 'Escribe solo letras A-Z, sin espacios ni acentos…',
    sample: 'CIFRATAB',
  },
  {
    id: 'sha256',
    name: 'SHA-256',
    tagline: '256 bits · 64 caracteres',
    description: 'Huella digital compacta y ampliamente utilizada.',
    kind: 'hash',
    algorithm: 'sha256',
    bits: 256,
    hashLength: 64,
    placeholder: 'Escribe solo letras, sin espacios ni acentos…',
    sample: 'LaPrivacidadEsUnDerecho',
  },
  {
    id: 'sha512',
    name: 'SHA-512',
    tagline: '512 bits · 128 caracteres',
    description: 'Digest más largo para una mayor resistencia.',
    kind: 'hash',
    algorithm: 'sha512',
    bits: 512,
    hashLength: 128,
    placeholder: 'Escribe solo letras, sin espacios ni acentos…',
    sample: 'LaPrivacidadEsUnDerecho',
  },
]

export const TOOL_MAP = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]))

export const HASH_LABELS = {
  sha256: 'SHA-256',
  sha512: 'SHA-512',
}
