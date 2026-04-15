import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { track, eventos } from '../lib/analytics'
import type { FormularioSimulacao } from '../types'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export function useSimulacao() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  async function simular(formulario: FormularioSimulacao) {
    setLoading(true)
    setErro(null)
    setTentativa(0)

    const MAX_TENTATIVAS = 3
    const ESPERAS = [3000, 6000] // ms entre tentativas

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      if (i > 0) {
        setTentativa(i)
        await sleep(ESPERAS[i - 1] ?? 6000)
      }

      try {
        const { data, error } = await supabase.functions.invoke('simulate', {
          body: formulario,
        })

        if (error) {
          // se for rate limit (429) ou erro temporário (502), tenta novamente
          const msg = error.message ?? ''
          if (i < MAX_TENTATIVAS - 1 && (msg.includes('502') || msg.includes('non-2xx') || msg.includes('429'))) {
            console.warn(`Tentativa ${i + 1} falhou, tentando novamente...`)
            continue
          }
          throw new Error(msg)
        }

        if (!data?.id) throw new Error('Resposta inválida do servidor')

        track(eventos.SIMULACAO_CONCLUIDA, { tipo: formulario.tipo, cargo: formulario.cargo_atual })
        setLoading(false)
        setTentativa(0)
        navigate(`/simulacao/${data.id}/resultado`)
        return
      } catch (e: any) {
        if (i < MAX_TENTATIVAS - 1) {
          console.warn(`Tentativa ${i + 1} erro: ${e.message}`)
          continue
        }
        setErro('Não foi possível processar a simulação. Verifique sua conexão e tente novamente.')
      }
    }

    setLoading(false)
    setTentativa(0)
  }

  return { simular, loading, erro, tentativa }
}
