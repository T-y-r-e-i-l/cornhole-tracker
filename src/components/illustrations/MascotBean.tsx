export type MascotPose = 'idle' | 'wave' | 'celebrate' | 'sympathetic'

interface MascotBeanProps {
  pose?: MascotPose
  className?: string
  size?: number
}

/** Flat cornhole-bag mascot — decorative only */
export function MascotBean({ pose = 'idle', className = '', size = 120 }: MascotBeanProps) {
  const shadowY = pose === 'celebrate' ? 98 : 104

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy={shadowY} rx="34" ry="8" fill="#1a1a1a" opacity="0.1" />
      <ellipse
        cx="60"
        cy={pose === 'celebrate' ? 58 : 62}
        rx="38"
        ry={pose === 'sympathetic' ? 40 : 44}
        fill="var(--color-board-tan)"
      />
      <ellipse cx="48" cy="54" r="4" fill="var(--color-ink)" />
      <ellipse cx="72" cy="54" r="4" fill="var(--color-ink)" />
      {pose === 'wave' && (
        <ellipse
          cx="92"
          cy="48"
          rx="14"
          ry="10"
          fill="var(--color-board-tan)"
          transform="rotate(-20 92 48)"
        />
      )}
      {pose === 'celebrate' && (
        <>
          <ellipse cx="28" cy="44" rx="12" ry="8" fill="var(--color-board-tan)" transform="rotate(25 28 44)" />
          <ellipse cx="92" cy="44" rx="12" ry="8" fill="var(--color-board-tan)" transform="rotate(-25 92 44)" />
        </>
      )}
      {pose === 'sympathetic' ? (
        <path
          d="M 48 72 Q 60 66 72 72"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M 48 70 Q 60 78 72 70"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {pose === 'celebrate' && (
        <>
          <circle cx="24" cy="28" r="3" fill="var(--color-sunset)" opacity="0.8" />
          <circle cx="96" cy="32" r="2.5" fill="var(--color-mint)" opacity="0.9" />
          <circle cx="60" cy="18" r="2" fill="var(--color-team-blue)" opacity="0.8" />
        </>
      )}
    </svg>
  )
}
