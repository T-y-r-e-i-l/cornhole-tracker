import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { getCurrentUserId, setCurrentUserId } from '../lib/currentUser'
import { onAuthSignedIn, pullForUser, setupOnlineSyncListener } from '../db/syncService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let removeOnlineListener: (() => void) | undefined

    const init = async () => {
      const { data } = await supabase!.auth.getSession()
      setSession(data.session)
      const userId = data.session?.user.id ?? null
      setCurrentUserId(userId)
      if (userId) {
        await onAuthSignedIn(userId)
        removeOnlineListener = setupOnlineSyncListener(userId)
      }
      setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession)
      const userId = nextSession?.user.id ?? null
      setCurrentUserId(userId)

      if (event === 'SIGNED_IN' && userId) {
        await onAuthSignedIn(userId)
        removeOnlineListener?.()
        removeOnlineListener = setupOnlineSyncListener(userId)
      }

      if (event === 'SIGNED_OUT') {
        setCurrentUserId(null)
        removeOnlineListener?.()
        removeOnlineListener = undefined
      }
    })

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const userId = getCurrentUserId()
      if (userId) void pullForUser(userId)
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      subscription.unsubscribe()
      removeOnlineListener?.()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' }
    }

    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setCurrentUserId(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signInWithMagicLink,
      signOut,
    }),
    [session, loading, signInWithMagicLink, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
