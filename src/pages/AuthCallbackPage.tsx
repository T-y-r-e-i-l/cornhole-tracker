import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    const finish = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } =
          await supabase!.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      } else {
        const { error: sessionError } = await supabase!.auth.getSession()
        if (sessionError) {
          setError(sessionError.message)
          return
        }
      }

      navigate('/', { replace: true })
    }

    void finish()
  }, [navigate])

  return (
    <AppShell title="Signing in" theme="light" inverseHeader>
      <p className="text-sm text-ink-muted text-center">
        {error ?? 'Completing sign-in…'}
      </p>
    </AppShell>
  )
}
