import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { track, eventos } from '../lib/analytics'

const PIX_KEY = import.meta.env.VITE_PIX_KEY ?? ''
const WHATSAPP = import.meta.env.VITE_WHATSAPP ?? ''

const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    preco_mensal: 197,
    descricao: 'Para RH de empresas em crescimento',
    cor: 'border-gray-200',
    destaque: false,
    recursos: [
      { texto: '20 simulações por mês', destaque: false },
      { texto: '4 tipos de simulação', destaque: false },
      { texto: 'Benchmark P25 / P50 / P75', destaque: false },
      { texto: 'Fontes de pesquisa salarial', destaque: false },
      { texto: 'Total Rewards + Compa-ratio', destaque: false },
      { texto: 'Análise de equidade interna', destaque: false },
      { texto: 'Análise de riscos', destaque: false },
      { texto: 'Exportação PDF', destaque: false },
      { texto: 'Suporte via WhatsApp', destaque: false },
    ],
  },
  {
    id: 'professional',
    nome: 'Professional',
    preco_mensal: 497,
    descricao: 'Para equipes de RH com uso estratégico',
    cor: 'border-primary-500',
    destaque: true,
    recursos: [
      { texto: 'Simulações ilimitadas', destaque: true },
      { texto: 'Tudo do Starter', destaque: false },
      { texto: 'ROI de Retenção automático', destaque: true },
      { texto: 'Flight Risk Score (0–100)', destaque: true },
      { texto: 'Roadmap Salarial Progressivo', destaque: true },
      { texto: 'Script de comunicação para gestores', destaque: true },
      { texto: 'Comparação de cenários', destaque: true },
      { texto: 'Histórico completo de simulações', destaque: false },
      { texto: 'Suporte prioritário', destaque: false },
    ],
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco_mensal: null,
    descricao: 'Para grandes empresas e consultorias de RH',
    cor: 'border-gray-200',
    destaque: false,
    recursos: [
      { texto: 'Tudo do Professional', destaque: false },
      { texto: 'Múltiplos usuários', destaque: true },
      { texto: 'Onboarding dedicado', destaque: false },
      { texto: 'Relatórios customizados', destaque: false },
      { texto: 'Treinamento da equipe', destaque: false },
      { texto: 'SLA garantido', destaque: false },
      { texto: 'Gerente de conta exclusivo', destaque: false },
      { texto: 'Integração via API (roadmap)', destaque: false },
    ],
  },
]

export default function Planos() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [anual, setAnual] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState<(typeof PLANOS)[0] | null>(null)
  const [copiado, setCopiado] = useState(false)

  function preco(p: typeof PLANOS[0]) {
    if (!p.preco_mensal) return null
    return anual ? Math.round(p.preco_mensal * 10 / 12) : p.preco_mensal
  }

  function handleSolicitar(plano: typeof PLANOS[0]) {
    if (plano.id === 'enterprise') {
      const texto = encodeURIComponent('Olá! Tenho interesse no plano Enterprise do RemunaIA. Podemos conversar?')
      window.open(`https://wa.me/55${WHATSAPP.replace(/\D/g, '')}?text=${texto}`, '_blank')
      return
    }
    track(eventos.UPGRADE_CLICADO, { plano: plano.id })
    setPlanoSelecionado(plano)
  }

  async function copiarChave() {
    await navigator.clipboard.writeText(PIX_KEY)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function abrirWhatsApp(plano: typeof PLANOS[0]) {
    const valorStr = anual
      ? `R$ ${((plano.preco_mensal ?? 0) * 10).toLocaleString('pt-BR')}/ano`
      : `R$ ${plano.preco_mensal}/mês`
    const texto = encodeURIComponent(
      `Olá! Quero assinar o plano ${plano.nome} do RemunaIA (${valorStr}). Segue o comprovante do PIX.`
    )
    window.open(`https://wa.me/55${WHATSAPP.replace(/\D/g, '')}?text=${texto}`, '_blank')
  }

  const planoAtualId = profile?.plano

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Planos e Preços</h1>
        <p className="text-gray-500 text-sm mt-2">
          Pagamento via PIX · Ativação em até 1 hora útil · Cancele quando quiser
        </p>
      </div>

      {/* Toggle mensal / anual */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!anual ? 'text-gray-900' : 'text-gray-400'}`}>Mensal</span>
        <button
          onClick={() => setAnual(a => !a)}
          className={`relative w-12 h-6 rounded-full transition-colors ${anual ? 'bg-primary-600' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${anual ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
        <span className={`text-sm font-medium ${anual ? 'text-gray-900' : 'text-gray-400'}`}>
          Anual
          <span className="ml-1.5 text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">
            2 meses grátis
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANOS.map(plano => {
          const planoAtual = planoAtualId === plano.id
          const precoMes = preco(plano)
          return (
            <div
              key={plano.id}
              className={`card p-6 flex flex-col border-2 ${plano.destaque ? 'border-primary-500 shadow-md' : 'border-gray-100'}`}
            >
              {plano.destaque && (
                <div className="text-center mb-3">
                  <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900">{plano.nome}</h2>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">{plano.descricao}</p>

              <div className="mb-1 min-h-[60px]">
                {precoMes ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary-700">
                        R$ {precoMes.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-gray-400 text-sm">/mês</span>
                    </div>
                    {anual && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        R$ {((plano.preco_mensal ?? 0) * 10).toLocaleString('pt-BR')}/ano · você economiza R$ {((plano.preco_mensal ?? 0) * 2).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-700 mt-2">Sob consulta</p>
                )}
              </div>

              <ul className="space-y-2 my-5 flex-1">
                {plano.recursos.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 ${r.destaque ? 'text-primary-500' : 'text-green-500'}`}>✓</span>
                    <span className={r.destaque ? 'font-medium text-gray-900' : 'text-gray-600'}>{r.texto}</span>
                  </li>
                ))}
              </ul>

              {planoAtual ? (
                <button disabled className="btn-secondary opacity-60 cursor-not-allowed">
                  ✓ Plano atual
                </button>
              ) : plano.id === 'enterprise' ? (
                <button onClick={() => handleSolicitar(plano)} className="btn-secondary">
                  Falar pelo WhatsApp
                </button>
              ) : (
                <button
                  onClick={() => handleSolicitar(plano)}
                  className={plano.destaque ? 'btn-primary' : 'btn-secondary'}
                >
                  Assinar via PIX
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Trial CTA */}
      {(!planoAtualId || planoAtualId === 'trial') && (
        <div className="card p-5 bg-primary-50 border border-primary-100 text-center">
          <p className="text-sm font-medium text-primary-800">
            Ainda no trial? Você tem <strong>3 simulações gratuitas</strong> para testar tudo sem compromisso.
          </p>
          <button onClick={() => navigate('/simulacao/nova')} className="btn-primary mt-3 text-sm">
            Usar simulação gratuita
          </button>
        </div>
      )}

      {/* Modal PIX */}
      {planoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Assinar plano {planoSelecionado.nome}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {anual
                ? `R$ ${((planoSelecionado.preco_mensal ?? 0) * 10).toLocaleString('pt-BR')}/ano (equivale a R$ ${preco(planoSelecionado)}/mês)`
                : `R$ ${planoSelecionado.preco_mensal}/mês`}
            </p>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Faça o PIX</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Valor: <strong>{anual ? `R$ ${((planoSelecionado.preco_mensal ?? 0) * 10).toLocaleString('pt-BR')}` : `R$ ${planoSelecionado.preco_mensal}`}</strong>
                  </p>
                  {PIX_KEY && (
                    <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600 flex-1 font-mono truncate">{PIX_KEY}</span>
                      <button onClick={copiarChave} className="text-xs text-primary-600 font-medium whitespace-nowrap">
                        {copiado ? '✓ Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Envie o comprovante</p>
                  <p className="text-xs text-gray-500 mt-0.5">Com seu e-mail de cadastro via WhatsApp</p>
                  {WHATSAPP && (
                    <button
                      onClick={() => abrirWhatsApp(planoSelecionado)}
                      className="mt-2 flex items-center gap-2 text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      💬 Abrir WhatsApp
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Aguarde a ativação</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ativação em até <strong>1 hora útil</strong> após confirmação.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setPlanoSelecionado(null)} className="mt-6 w-full btn-secondary">
              Fechar
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pb-4">
        Sem contrato de fidelidade · Cancele a qualquer momento · Suporte via WhatsApp
      </p>
    </div>
  )
}
