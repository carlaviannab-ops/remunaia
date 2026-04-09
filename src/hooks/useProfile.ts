import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [user])

  async function atualizar(campos: Partial<Profile>) {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .update(campos)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
  }

  return { profile, loading, atualizar }
}
