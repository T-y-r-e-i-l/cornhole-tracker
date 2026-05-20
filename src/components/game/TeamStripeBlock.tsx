interface TeamStripeBlockProps {
  used: number
  total: number
  colorClass: string
}

/** Horizontal bag stripes beside the score (mockup-style). */
export function TeamStripeBlock({ used, total, colorClass }: TeamStripeBlockProps) {
  return (
    <div
      className="flex flex-col gap-1 w-11 shrink-0 py-0.5"
      aria-label={`${total - used} bags remaining`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'h-2.5 w-full rounded-sm transition-colors',
            used >= i + 1 ? 'bg-white border border-ink/10' : colorClass,
          ].join(' ')}
        />
      ))}
    </div>
  )
}
