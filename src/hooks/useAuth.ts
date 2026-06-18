import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let currentUserId: string | null = null

    const fetchProfile = async (userId: string, tentativa = 0) => {
      if (!isMounted || userId !== currentUserId) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!isMounted || userId !== currentUserId) return
      if (!data && tentativa < 4) {
        // Retry com backoff caso o trigger ainda não tenha criado o profile
        await new Promise(res => setTimeout(res, 400 * (tentativa + 1)))
        return fetchProfile(userId, tentativa + 1)
      }
      setProfile(data)
      setLoading(false)
    }

    // Ouvir mudanças de auth como fonte primária
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      const nextUser = session?.user ?? null
      currentUserId = nextUser?.id ?? null
      setUser(nextUser)
      if (nextUser) fetchProfile(nextUser.id)
      else { setProfile(null); setLoading(false) }
    })

    // Inicializar com sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      // onAuthStateChange já vai disparar para sessões novas (SIGNED_IN)
      // Aqui só tratamos sessões já existentes que não disparam onAuthStateChange
      if (!session?.user) { setUser(null); setLoading(false) }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}
