import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { track, eventos } from '../lib/analytics'
import type { FormularioSimulacao, TipoMovimento } from '../types'

export function useSimulacao() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function simular(tipo: TipoMovimento, formulario: FormularioSimulacao) {
    setLoading(true)
    setErro(null)

    try {
      const { data, error } = await supabase.functions.invoke('simulate', {
        body: { tipo, formulario },
      })

      if (error) throw new Error(error.message)
      if (!data?.id) throw new Error('Resposta inválida do servidor')

      track(eventos.simulacaoCriada, { tipo, cargo: formulario.cargo })
      navigate(`/simulacao/${data.id}/resultado`)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao processar simulação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return { simular, loading, erro }
}
