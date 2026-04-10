import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatarData } from '../lib/utils'
import Spinner from '../components/ui/Spinner'
import type { Profile, Plano } from '../types'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? ''

const planos: Plano[] = ['trial', 'starter', 'professional', 'enterprise', 'cancelado']

const corPlano: Record<string, string> = {
  trial:        'bg-gray-100 text-gray-700',
  starter:      'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  enterprise:   'bg-yellow-100 text-yellow-700',
  cancelado:    'bg-red-100 text-red-700',
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  // Protege a rota: só o admin pode acessar
  useEffect(() => {
    if (!authLoading && user?.email !== ADMIN_EMAIL) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return
    supabase
      .from('profiles')
      .select('*')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        setProfiles(data ?? [])
        setLoading(false)
      })
  }, [user])

  async function atualizarPlano(profileId: string, novoPlano: Plano) {
    setSalvando(profileId)
    await supabase
      .from('profiles')
      .update({ plano: novoPlano })
      .eq('id', profileId)
    setProfiles(prev =>
      prev.map(p => (p.id === profileId ? { ...p, plano: novoPlano } : p))
    )
    setSalvando(null)
  }

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-64"><Spinner tamanho="lg" /></div>
  }

  const filtrados = profiles.filter(p => {
    const t = busca.toLowerCase()
    return p.nome?.toLowerCase().includes(t) || p.empresa?.toLowerCase().includes(t)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie planos dos usuários</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs text-yellow-700 font-medium">
          🔒 Acesso restrito
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {planos.map(p => {
          const count = profiles.filter(u => u.plano === p).length
          return (
            <div key={p} className="card p-4 text-center">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${corPlano[p]}`}>
                {p}
              </span>
            </div>
          )
        })}
      </div>

      {/* Busca */}
      <input
        className="input max-w-sm"
        placeholder="Buscar por nome ou empresa..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {/* Tabela de usuários */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Usuário</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Empresa</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Simulações</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Desde</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Plano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{p.nome || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.empresa || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {p.simulacoes_usadas_mes}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {formatarData(p.criado_em)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={p.plano}
                          onChange={e => atualizarPlano(p.id, e.target.value as Plano)}
                          disabled={salvando === p.id}
                          className="input py-1 text-sm max-w-[150px]"
                        >
                          {planos.map(pl => (
                            <option key={pl} value={pl}>{pl}</option>
                          ))}
                        </select>
                        {salvando === p.id && (
                          <Spinner tamanho="sm" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
