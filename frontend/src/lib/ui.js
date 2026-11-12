export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

export const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy'

export const focusRingInput =
  'focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10'

export const panel =
  'rounded-2xl border border-line bg-cream-light shadow-soft'

export const buttonBase =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-45'

export const buttonPrimary = `${buttonBase} border-accent bg-accent text-white shadow-soft hover:border-accent-deep hover:bg-accent-deep ${focusRing}`

export const buttonSecondary = `${buttonBase} border-line bg-cream-light text-navy hover:border-accent/40 hover:bg-accent-soft ${focusRing}`
