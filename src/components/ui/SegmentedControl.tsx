type SegmentTheme = 'dark' | 'light'

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  theme?: SegmentTheme
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  theme = 'dark',
}: SegmentedControlProps<T>) {
  const isLight = theme === 'light'

  return (
    <fieldset className="w-full">
      <legend
        className={[
          'label-caps mb-2',
          isLight ? 'text-ink' : 'text-on-dark-muted',
        ].join(' ')}
      >
        {label}
      </legend>
      <div
        className={['flex gap-2', isLight ? '' : 'rounded-2xl bg-surface-dark-elevated p-1 border border-on-dark/10'].join(' ')}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                'flex-1 min-h-12 rounded-lg text-xs font-bold tracking-widest uppercase transition',
                isLight
                  ? selected
                    ? 'border border-ink bg-ink text-white'
                    : 'border border-ink bg-white text-ink hover:bg-surface-cream-muted'
                  : selected
                    ? 'bg-mint text-ink shadow-sm'
                    : 'text-on-dark-muted hover:text-on-dark',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
