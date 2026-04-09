import { useNavigate } from 'react-router-dom'
import { track, eventos } from '../lib/analytics'

const beneficios = [
  {
    icone: '⚡',
    titulo: 'Decisões em segundos',
    descricao: 'A IA analisa benchmarks de mercado e gera recomendações completas em menos de 30 segundos.',
  },
  {
    icone: '📊',
    titulo: 'Benchmark atualizado',
    descricao: 'Comparativo P25/P50/P75 com base em dados reais de mercado para o cargo e localização.',
  },
  {
    icone: '⚖️',
    titulo: 'Equidade interna',
    descricao: 'Análise automática de equidade para garantir consistência salarial em toda a empresa.',
  },
  {
    icone: '🛡️',
    titulo: 'Análise de riscos',
    descricao: 'Identifica riscos de retenção, orçamento e equidade antes de qualquer aprovação.',
  },
  {
    icone: '📄',
    titulo: 'Relatório em PDF',
    descricao: 'Gere relatórios profissionais para apresentar ao comitê com um clique.',
  },
  {
    icone: '🔐',
    titulo: 'Seguro e confidencial',
    descricao: 'Dados criptografados e em conformidade com a LGPD. Nenhuma informação é compartilhada.',
  },
]

const simulacoes = [
  { tipo: 'Promoção', icone: '🚀' },
  { tipo: 'Aumento Salarial', icone: '📈' },
  { tipo: 'Nova Contratação', icone: '🤝' },
  { tipo: 'Ajuste de Faixa', icone: '⚖️' },
]

export default function Landing() {
  const navigate = useNavigate()

  function handleCTA() {
    track(eventos.cadastroIniciado, { origem: 'landing_hero' })
    navigate('/cadastro')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-xl font-bold text-primary-700">RemunaIA</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900">
            Entrar
          </button>
          <button onClick={handleCTA} className="btn-primary text-sm">
            Começar grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          ✨ Inteligência Artificial para RH estratégico
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Decisões de remuneração
          <br />
          <span className="text-primary-600">com confiança e agilidade</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Simule promoções, aumentos, novas contratações e ajustes de faixa com análise de benchmark,
          equidade interna e recomendação da IA — em segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleCTA} className="btn-primary text-base px-8 py-3">
            Começar gratuitamente
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary text-base px-8 py-3"
          >
            Já tenho conta
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">Sem cartão de crédito · 7 dias grátis</p>
      </section>

      {/* Tipos de simulação */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            4 tipos de simulação
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {simulacoes.map(s => (
              <div key={s.tipo} className="card p-5 text-center">
                <div className="text-3xl mb-2">{s.icone}</div>
                <p className="font-semibold text-gray-900 text-sm">{s.tipo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Tudo que o RH estratégico precisa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {beneficios.map(b => (
            <div key={b.titulo} className="flex gap-4">
              <div className="text-2xl">{b.icone}</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{b.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">{b.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Pronto para tomar decisões melhores?
          </h2>
          <p className="text-primary-100 mb-8">
            Junte-se a gestores de RH que já usam o RemunaIA para decisões mais rápidas e embasadas.
          </p>
          <button
            onClick={handleCTA}
            className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Começar agora — é grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-6 mb-3">
          <a href="/termos" className="hover:text-gray-600">Termos de Uso</a>
          <a href="/privacidade" className="hover:text-gray-600">Privacidade</a>
          <a href="/cookies" className="hover:text-gray-600">Cookies</a>
        </div>
        <p>© {new Date().getFullYear()} RemunaIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
