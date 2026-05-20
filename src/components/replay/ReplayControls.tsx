interface ReplayControlsProps {
  step: number
  maxStep: number
  onPrev: () => void
  onNext: () => void
  onSlider: (value: number) => void
}

export function ReplayControls({
  step,
  maxStep,
  onPrev,
  onNext,
  onSlider,
}: ReplayControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md shrink-0 pb-2">
      <input
        type="range"
        min={0}
        max={maxStep}
        value={step}
        onChange={(e) => onSlider(Number(e.target.value))}
        className="w-full h-2 accent-mint rounded-full"
        aria-label="Replay step"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={step <= 0}
          className="flex-1 min-h-12 rounded-2xl border border-ink/15 bg-surface-cream-muted text-ink font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <span className="flex items-center px-2 text-sm text-ink-muted tabular-nums">
          {step} / {maxStep}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={step >= maxStep}
          className="flex-1 min-h-12 rounded-2xl border border-ink/15 bg-surface-cream-muted text-ink font-semibold disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
