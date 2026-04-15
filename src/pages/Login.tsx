import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { track, eventos } from '../lib/analytics'
import Spinner from '../components/ui/Spinner'

interface Props {
  modo?: 'login' | 'cadastro'
}

export default function Login({ modo = 'login' }: Props) {
  const [isCadastro, setIsCadastro] = useState(modo === 'cadastro')
  const [isRecuperacao, setIsRecuperacao] = useState(false)
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setLoading(true)

    if (isRecuperacao) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/conta`,
      })
      setLoading(false)
      if (error) { setErro('Não foi possível enviar o e-mail. Tente novamente.'); return }
      setSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      return
    }

    if (isCadastro) {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome, empresa } }
      })
      if (error) { setErro(error.message); setLoading(false); return }
      track(eventos.CADASTRO, { empresa })
      navigate('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) { setErro('Email ou senha incorretos'); setLoading(false); return }
      track(eventos.LOGIN)
      navigate('/dashboard')
    }
    setLoading(false)
  }

  if (isRecuperacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-700">RemunaIA</h1>
            <p className="text-gray-500 text-sm mt-1">Recuperar senha</p>
          </div>

          {sucesso ? (
            <div className="text-center space-y-4">
              <p className="text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm">{sucesso}</p>
              <button onClick={() => { setIsRecuperacao(false); setSucesso('') }} className="text-primary-600 text-sm hover:underline">
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {erro && <p className="text-red-600 text-sm">{erro}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading && <Spinner tamanho="sm" />}
                Enviar link de recuperação
              </button>
              <button type="button" onClick={() => setIsRecuperacao(false)} className="w-full text-sm text-gray-500 hover:text-gray-700">
                Voltar para o login
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-700">RemunaIA</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isCadastro ? 'Crie sua conta gratuita' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCadastro && (
            <>
              <div>
                <label className="label">Nome completo</label>
                <input className="input" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div>
                <label className="label">Empresa</label>
                <input className="input" value={empresa} onChange={e => setEmpresa(e.target.value)} required />
              </div>
            </>
          )}
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Senha {isCadastro && <span className="text-gray-400 font-normal">(mínimo 8 caracteres)</span>}</label>
            <input className="input" type="password" minLength={8} value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>

          {!isCadastro && (
            <div className="text-right -mt-1">
              <button type="button" onClick={() => setIsRecuperacao(true)} className="text-xs text-primary-600 hover:underline">
                Esqueci minha senha
              </button>
            </div>
          )}

          {erro && <p className="text-red-600 text-sm">{erro}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Spinner tamanho="sm" />}
            {isCadastro ? 'Criar conta gratuita' : 'Entrar'}
          </button>
        </form>

        {/* Troca modo */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isCadastro ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button onClick={() => setIsCadastro(!isCadastro)} className="text-primary-600 font-medium hover:underline">
            {isCadastro ? 'Entrar' : 'Criar conta gratuita'}
          </button>
        </p>

        {isCadastro && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Ao criar sua conta, você concorda com os{' '}
            <Link to="/termos" className="underline">Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" className="underline">Política de Privacidade</Link>.
          </p>
        )}
      </div>
    </div>
  )
}
