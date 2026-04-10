import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

export default function SimulacaoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

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
          navigate('/historico', { replace: true })
        }
      })
  }, [id, navigate])

  return (
    <div className="flex justify-center items-center h-64">
      <Spinner tamanho="lg" />
    </div>
  )
}
