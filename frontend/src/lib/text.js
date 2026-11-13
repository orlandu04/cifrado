/**
 * Reglas compartidas para preparar el texto antes de enviarlo a la API.
 *
 * La validación del backend acepta únicamente letras ASCII, por lo que el
 * saneamiento se aplica mientras el usuario escribe y también al abrir el
 * comparador de hashes. Centralizar estas reglas evita que el editor y el modal
 * acepten o transformen el texto de forma distinta.
 */

// Debe coincidir con MAX_TEXT_LENGTH del backend para que el textarea y la
// validación del servidor rechacen los mismos textos demasiado largos.
export const MAX_TEXT_LENGTH = 100000

// Todo lo que no sea una letra A-Z/a-z se elimina del texto.
const NON_LETTERS = /[^A-Za-z]/g

/**
 * Sanea el texto de Atbash: quita caracteres no alfabéticos y normaliza a
 * mayúsculas, que es el formato que devuelve el backend.
 *
 * @param {string} value Texto escrito por el usuario.
 * @returns {string} Texto con solo letras A-Z.
 */
export function sanitizeAtbash(value) {
  return value.replace(NON_LETTERS, '').toUpperCase()
}

/**
 * Sanea el texto para hashing. Igual que Atbash, normaliza a mayúsculas para
 * que minúsculas y mayúsculas produzcan el mismo hash.
 *
 * @param {string} value Texto escrito por el usuario.
 * @returns {string} Texto con solo letras A-Z en mayúsculas.
 */
export function sanitizeHashText(value) {
  return value.replace(NON_LETTERS, '').toUpperCase()
}
