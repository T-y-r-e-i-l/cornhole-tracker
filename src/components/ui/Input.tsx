import type { InputHTMLAttributes } from 'react'

type InputTheme = 'dark' | 'light'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  theme?: InputTheme
}

const themeClasses: Record<InputTheme, string> = {
  dark: [
    'border-on-dark/15 bg-surface-dark-elevated text-on-dark',
    'placeholder:text-on-dark-muted/60',
    'focus:ring-mint/40 focus:border-mint/50',
  ].join(' '),
  light: [
    'border-ink bg-white text-ink font-semibold uppercase tracking-wide',
    'placeholder:text-ink-faint placeholder:font-normal placeholder:normal-case',
    'focus:ring-ink/15 focus:border-ink',
  ].join(' '),
}

const labelClasses: Record<InputTheme, string> = {
  dark: 'text-on-dark-muted',
  light: 'text-ink',
}

export function Input({
  label,
  theme = 'dark',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase() ?? 'input'
  const field = (
    <input
      id={inputId}
      className={[
        'w-full min-h-12 rounded-lg border px-3 py-2.5',
        'focus:outline-none focus:ring-2',
        themeClasses[theme],
        className,
      ].join(' ')}
      {...props}
    />
  )

  if (!label) return field

  return (
    <label className="block w-full" htmlFor={inputId}>
      <span className={['label-caps mb-2 block', labelClasses[theme]].join(' ')}>
        {label}
      </span>
      {field}
    </label>
  )
}

interface PlayerRowProps {
  label: string
  values: string[]
  placeholders?: string[]
  onChange: (index: number, value: string) => void
}

export function PlayerRow({ label, values, placeholders, onChange }: PlayerRowProps) {
  return (
    <div className="w-full">
      <span className="label-caps text-ink mb-2 block">{label}</span>
      <div className="flex gap-2">
        {values.map((value, i) => (
          <Input
            key={i}
            theme="light"
            aria-label={`${label} player ${i + 1}`}
            value={value}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholders?.[i] ?? 'Name'}
          />
        ))}
      </div>
    </div>
  )
}
