import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-surface-cream text-ink">
        <p className="text-sm text-center max-w-sm">
          Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to a <code className="text-xs">.env</code>{' '}
          file (see <code className="text-xs">.env.example</code>).
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-cream text-ink-muted text-sm">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
