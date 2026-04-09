import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Resultado from './Resultado'
import Spinner from '../components/ui/Spinner'

// SimulacaoDetalhe redireciona para o componente Resultado (mesma view)
export default function SimulacaoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [existe, setExiste] = useState<boolean | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('simulacoes')
      .select('id')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          navigate(`/simulacao/${id}/resultado`, { replace: true })
        } else {
          setExiste(false)
        }
      })
  }, [id, navigate])

  if (existe === false) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Simulação não encontrada.</p>
        <button onClick={() => navigate('/historico')} className="btn-primary mt-4">
          Ver histórico
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-64">
      <Spinner tamanho="lg" />
    </div>
  )
}
