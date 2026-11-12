/**
 * Estilos reutilizables para mantener consistencia visual entre componentes.
 *
 * Se exportan cadenas de clases de Tailwind en lugar de componentes para que
 * cada elemento conserve su semántica HTML (button, section, etc.) y pueda
 * combinarlas con utilidades específicas de su contexto.
 */

// Anillo de foco sobre fondos claros. Se usa en botones y tarjetas clicables.
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

// Foco específico para campos de texto: borde y halo suave en lugar de anillo.
export const focusRingInput =
  'focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10'

// Contenedor base de las tarjetas principales de la interfaz.
export const panel =
  'rounded-2xl border border-line bg-cream-light shadow-soft'

// Propiedades compartidas por todos los botones del proyecto.
export const buttonBase =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-45'

// Acción principal: alto contraste con el color de acento.
export const buttonPrimary = `${buttonBase} border-accent bg-accent text-white shadow-soft hover:border-accent-deep hover:bg-accent-deep ${focusRing}`

// Acción secundaria: fondo claro y borde sutil para no competir con la principal.
export const buttonSecondary = `${buttonBase} border-line bg-cream-light text-navy hover:border-accent/40 hover:bg-accent-soft ${focusRing}`
