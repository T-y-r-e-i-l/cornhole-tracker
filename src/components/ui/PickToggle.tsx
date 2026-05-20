interface PickToggleProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function PickToggle({ label, value, options, onChange }: PickToggleProps) {
  return (
    <fieldset className="w-full">
      <legend className="label-caps text-ink mb-2">{label}</legend>
      <div
        className={[
          'gap-2',
          options.length > 2 ? 'grid grid-cols-2' : 'flex',
        ].join(' ')}
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
                'flex-1 min-h-12 rounded-lg border text-sm font-bold uppercase tracking-wide truncate px-2 transition',
                selected
                  ? 'border-ink bg-ink text-white'
                  : 'border-ink bg-white text-ink hover:bg-surface-cream-muted',
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
