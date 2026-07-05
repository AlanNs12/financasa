interface LogoProps {
  size?: number
  className?: string
  variant?: 'auto' | 'light' | 'dark'
}

export function Logo({ size = 32, className, variant = 'auto' }: LogoProps) {
  const fillColor =
    variant === 'light' ? '#FFFFFF' :
    variant === 'dark'  ? '#0F1115' :
    'currentColor'

  const cutoutColor =
    variant === 'light' ? '#0F1115' :
    variant === 'dark'  ? '#FFFFFF' :
    'var(--background)'

  return (
    <svg
      width={size}
      height={Math.round(size * 0.93)}
      viewBox="0 0 140 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Financasa"
      role="img"
      className={className}
    >
      <path
        d="M70 6 L124 54 L124 112 L42 112 L42 130 L18 130 L18 54 Z"
        fill={fillColor}
      />
      <polygon
        points="42,92 42,72 108,54 108,66"
        fill={cutoutColor}
      />
      <rect x="68" y="76" width="22" height="19" fill={cutoutColor} />
    </svg>
  )
}
