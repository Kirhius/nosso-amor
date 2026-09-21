export const CAMINHO_CORACAO =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

export function Coracao({ cheio = false, className }: { cheio?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={cheio ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={cheio ? 0 : 1.6}
      strokeLinejoin="round"
    >
      <path d={CAMINHO_CORACAO} />
    </svg>
  )
}

const traco = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconeCamera() {
  return (
    <svg {...traco}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export function IconeBrilho() {
  return (
    <svg {...traco}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16v4M17 18h4" />
    </svg>
  )
}

export function IconeLinha() {
  return (
    <svg {...traco}>
      <path d="M12 4v16" />
      <circle cx="12" cy="7" r="2" />
      <circle cx="12" cy="17" r="2" />
      <path d="M14 7h6M4 17h6" />
    </svg>
  )
}

export function IconeApagar() {
  return (
    <svg {...traco}>
      <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
      <path d="M14 9.5l5 5M19 9.5l-5 5" />
    </svg>
  )
}

export function IconePin() {
  return (
    <svg {...traco}>
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}
