import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { signInWithMagicLink, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await signInWithMagicLink(email)
      if (result.error) {
        setError(result.error)
        setSent(false)
      } else {
        setSent(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title="Sign in" theme="light" inverseHeader>
      <section className="w-full flex-1 max-w-sm mx-auto space-y-6">
        <div className="border-2 border-ink rounded-lg bg-white p-5 space-y-4">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-ink">
            Your account
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Sign in with a magic link sent to your email. Your games sync across devices.
          </p>

          {!configured && (
            <p className="text-sm text-team-red-deep bg-team-red/10 rounded-lg p-3">
              Supabase is not configured. Copy <code className="text-xs">.env.example</code> to{' '}
              <code className="text-xs">.env</code> and add your project URL and anon key.
            </p>
          )}

          {sent ? (
            <p className="text-sm text-ink font-medium">
              Check your email for a sign-in link. You can close this tab after you click it.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                theme="light"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {error && (
                <p className="text-sm text-team-red-deep" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" fullWidth disabled={submitting || !configured}>
                {submitting ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  )
}
