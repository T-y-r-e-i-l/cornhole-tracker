import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'mint' | 'outline-dark' | 'ghost-light'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  mint: 'bg-mint text-ink font-bold hover:bg-mint-hover active:scale-[0.98]',
  'outline-dark':
    'border border-on-dark/20 text-on-dark hover:border-on-dark/40 bg-transparent',
  'ghost-light': 'text-ink-muted hover:text-ink bg-transparent',
}

export function Button({
  variant = 'mint',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'min-h-14 rounded-lg px-5 text-sm font-extrabold tracking-widest uppercase transition',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
