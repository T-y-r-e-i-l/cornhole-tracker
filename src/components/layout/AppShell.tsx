import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

export type ShellTheme = 'dark' | 'light'

interface AppShellProps {
  children: ReactNode
  title?: string
  backTo?: string
  actions?: ReactNode
  theme?: ShellTheme
  hideHeader?: boolean
  /** Black bar header on cream pages (home menu) */
  inverseHeader?: boolean
}

export function AppShell({
  children,
  title,
  backTo,
  actions,
  theme = 'dark',
  hideHeader,
  inverseHeader,
}: AppShellProps) {
  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark')
    return () => {
      document.body.classList.remove('theme-dark', 'theme-light')
    }
  }, [theme])

  return (
    <div
      className={[
        'min-h-dvh flex flex-col max-w-lg mx-auto w-full',
        theme === 'light' ? 'bg-surface-cream text-ink' : 'bg-surface-dark text-on-dark',
      ].join(' ')}
    >
      {!hideHeader && (
        <header
          className={[
            'flex items-center gap-3 px-4 shrink-0',
            inverseHeader
              ? 'bg-ink text-white py-4'
              : [
                  'py-3',
                  theme === 'light' ? 'border-b border-ink/10' : 'border-b border-on-dark/10',
                ].join(' '),
          ].join(' ')}
        >
          {backTo ? (
            <Link
              to={backTo}
              className={[
                'text-sm min-h-11 flex items-center font-medium',
                inverseHeader
                  ? 'text-white/80 hover:text-white'
                  : theme === 'light'
                    ? 'text-team-blue-deep'
                    : 'text-mint',
              ].join(' ')}
            >
              ← Back
            </Link>
          ) : (
            <span className="w-14" />
          )}
          <h1
            className={[
              'flex-1 text-center text-sm font-bold tracking-[0.2em] uppercase truncate',
              inverseHeader ? 'text-white' : '',
            ].join(' ')}
          >
            {title ?? 'Cornhole'}
          </h1>
          <div
            className={[
              'w-14 flex justify-end text-sm',
              inverseHeader ? 'text-mint' : '',
            ].join(' ')}
          >
            {actions}
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col items-center px-4 py-4 gap-4 w-full min-h-0">
        {children}
      </main>
    </div>
  )
}
