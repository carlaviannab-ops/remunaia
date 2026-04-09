import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

export default function Conta() {
  const { user } = useAuth()
  const { profile, loading, atualizar } = useProfile()
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [empresa, setEmpresa] = useState(profile?.empresa ?? '')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    await atualizar({ nome, empresa })
    setMensagem('Dados salvos com sucesso!')
    setSalvando(false)
    setTimeout(() => setMensagem(''), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner tamanho="md" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Dados do perfil</h2>
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input className="input opacity-60" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="label">Empresa</label>
            <input
              className="input"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {mensagem && <span className="text-sm text-green-600">{mensagem}</span>}
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Plano atual</h2>
        <p className="text-gray-500 text-sm mb-4">
          Você está no plano <strong className="capitalize">{profile?.plano ?? 'Starter'}</strong>.
        </p>
        <a href="/planos" className="btn-secondary text-sm">
          Ver todos os planos
        </a>
      </div>

      <div className="card p-6 border-red-100">
        <h2 className="font-semibold text-gray-900 mb-2">Sair da conta</h2>
        <p className="text-gray-500 text-sm mb-4">
          Você será desconectado deste dispositivo.
        </p>
        <button onClick={handleLogout} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
          Sair
        </button>
      </div>
    </div>
  )
}
