export default function Privacidade() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-primary-600 hover:underline">← Voltar</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Quem somos</h2>
            <p>O RemunaIA é uma plataforma de simulação de remuneração estratégica operada por pessoa física com CNPJ em processo de formalização, com sede em Curitiba/PR. Para dúvidas sobre privacidade, entre em contato: <a href="mailto:carla.viannab@gmail.com" className="text-primary-600 hover:underline">carla.viannab@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Dados coletados</h2>
            <p>Coletamos apenas os dados necessários para a prestação do serviço:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Cadastro:</strong> nome completo, e-mail e empresa.</li>
              <li><strong>Simulações:</strong> cargo, faixa salarial, regime de contratação, estado, setor e, opcionalmente, valores de benefícios. Não coletamos nome de colaboradores — os dados são anônimos por padrão.</li>
              <li><strong>Pagamento:</strong> não armazenamos dados bancários. O pagamento é realizado via PIX diretamente pelo usuário; apenas recebemos o comprovante via WhatsApp para confirmação manual.</li>
              <li><strong>Uso:</strong> logs de acesso, número de simulações realizadas e plano ativo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Finalidade e base legal (LGPD)</h2>
            <p>Utilizamos os dados coletados para as seguintes finalidades, com as respectivas bases legais da Lei 13.709/2018 (LGPD):</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Prestação do serviço</strong> — execução do contrato (art. 7º, V).</li>
              <li><strong>Gestão de conta e plano</strong> — execução do contrato (art. 7º, V).</li>
              <li><strong>Comunicações transacionais</strong> (confirmação de ativação, suporte) — legítimo interesse (art. 7º, IX).</li>
              <li><strong>Melhoria do serviço e análise de uso</strong> — legítimo interesse (art. 7º, IX).</li>
              <li><strong>Cumprimento de obrigações legais</strong> — obrigação legal (art. 7º, II).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Compartilhamento de dados</h2>
            <p>Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Os dados trafegam apenas com os seguintes prestadores de serviço essenciais:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — banco de dados e autenticação (servidores na AWS us-east-1).</li>
              <li><strong>Groq</strong> — processamento de linguagem natural para geração das análises. Os dados de simulação são enviados via API para geração do resultado e não são retidos pelo provedor para treinamento.</li>
              <li><strong>Netlify</strong> — hospedagem da aplicação web.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Transferência internacional</h2>
            <p>Alguns prestadores acima operam servidores fora do Brasil. A transferência ocorre com base em cláusulas contratuais padrão e adoção de salvaguardas adequadas, conforme o art. 33 da LGPD.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Retenção e exclusão</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, os dados são retidos por até 90 dias e então excluídos, salvo obrigação legal de guarda por prazo superior. Para solicitar a exclusão antecipada, entre em contato pelo e-mail abaixo.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Segurança</h2>
            <p>Adotamos as seguintes medidas de segurança: autenticação com senha (mínimo 8 caracteres), comunicação criptografada via HTTPS/TLS, controle de acesso por Row Level Security no banco de dados, e tokens de sessão com expiração automática.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Seus direitos (LGPD, art. 18)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Confirmar a existência de tratamento e acessar seus dados.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogar o consentimento quando o tratamento for baseado nele.</li>
              <li>Solicitar a portabilidade dos dados.</li>
              <li>Peticionar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
            </ul>
            <p className="mt-2">Para exercer qualquer desses direitos, envie um e-mail para <a href="mailto:carla.viannab@gmail.com" className="text-primary-600 hover:underline">carla.viannab@gmail.com</a>. Responderemos em até 15 dias úteis.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Cookies e rastreamento</h2>
            <p>Utilizamos apenas cookies de sessão essenciais para manter você autenticado. Não utilizamos cookies de terceiros para publicidade ou rastreamento comportamental.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Menores de idade</h2>
            <p>O RemunaIA é destinado exclusivamente a profissionais adultos. Não coletamos dados de menores de 18 anos intencionalmente.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">11. Alterações nesta política</h2>
            <p>Podemos atualizar esta política periodicamente. Notificaremos usuários ativos por e-mail sobre mudanças relevantes. A data de "última atualização" no topo sempre reflete a versão vigente.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">12. Contato e Encarregado (DPO)</h2>
            <p>Para questões sobre privacidade e proteção de dados: <a href="mailto:carla.viannab@gmail.com" className="text-primary-600 hover:underline">carla.viannab@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
