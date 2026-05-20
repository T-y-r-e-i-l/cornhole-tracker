interface BagTrackerProps {
  used: number
  total: number
  colorClass: string
}

export function BagTracker({ used, total, colorClass }: BagTrackerProps) {
  return (
    <div className="flex flex-col gap-1 w-[4.5rem]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'h-2.5 rounded-full transition-colors',
            used >= i + 1 ? 'bg-white border border-ink/10' : colorClass,
          ].join(' ')}
        />
      ))}
    </div>
  )
}

interface BagTrackerColumnProps {
  teamLabel: string
  used: number
  total: number
  colorClass: string
  showUsageLabel?: boolean
}

export function BagTrackerColumn({
  teamLabel,
  used,
  total,
  colorClass,
  showUsageLabel = true,
}: BagTrackerColumnProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <BagTracker used={used} total={total} colorClass={colorClass} />
      {showUsageLabel && (
        <p className="label-caps text-ink-muted text-center leading-tight max-w-[5.5rem]">
          {teamLabel} bags: {used}/{total} used
        </p>
      )}
    </div>
  )
}

export function padScore(n: number, width = 2) {
  return String(n).padStart(width, '0')
}
