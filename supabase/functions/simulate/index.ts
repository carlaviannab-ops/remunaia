import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const LIMITES: Record<string, number> = {
  trial: 3, starter: 20, professional: 999999, enterprise: 999999, cancelado: 0,
}

const PROMPT_SISTEMA = `Você é um consultor sênior especialista em remuneração estratégica no Brasil.
Analise a simulação e retorne APENAS JSON válido (sem markdown, sem texto extra).

Estrutura obrigatória:
{
  "tabela_financeira": [
    { "componente": "Salário Base", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number },
    { "componente": "Encargos (CLT ~70%)", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number },
    { "componente": "Custo Total Mensal", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number }
  ],
  "benchmark_mercado": { "p25": number, "p50": number, "p75": number, "fonte": "Mercer/Catho Brasil 2024 (estimativa)" },
  "equidade_interna": { "status": "adequado", "posicao_relativa": "string", "minimo_grupo": number, "mediana_grupo": number, "maximo_grupo": number, "observacao": "string" },
  "riscos": [{ "nivel": "baixo", "descricao": "string", "mitigacao": "string" }],
  "recomendacao": { "decisao": "aprovado", "justificativa": "string detalhada em português", "salario_sugerido": number, "percentual_sugerido": number, "proximos_passos": ["string"] },
  "conclusao": "string com conclusão estratégica em português",
  "total_rewards": {
    "salario_base": number,
    "vr_mensal": number,
    "vt_mensal": number,
    "plano_saude_mensal": number,
    "plr_anual": number,
    "bonus_anual": number,
    "total_anual": number,
    "compa_ratio": number,
    "posicao_faixa": "abaixo"
  }
}

Instruções para total_rewards (use o salário PROPOSTO):
- salario_base: salário_proposto informado
- vr_mensal, vt_mensal, plano_saude_mensal: use os valores informados no formulário (0 se não informado)
- plr_anual: salario_base * 12 * (plr_percentual/100). Se não informado, use 0
- bonus_anual: salario_base * 12 * (bonus_target_percentual/100). Se não informado, use 0
- total_anual: (salario_base + vr_mensal + vt_mensal + plano_saude_mensal) * 12 + plr_anual + bonus_anual
- compa_ratio: (salario_base / benchmark_mercado.p50) * 100, arredondado para 1 decimal
- posicao_faixa: "abaixo" se compa_ratio < 90, "dentro" se entre 90 e 110, "acima" se > 110

Adicione também os campos abaixo na raiz do JSON:

"roi_retencao": {
  "custo_turnover_estimado": number,
  "custo_aumento_anual": number,
  "roi_multiplicador": number,
  "fator_utilizado": number,
  "interpretacao": "string em português"
}
Instruções para roi_retencao (só calcule se tipo != "ajuste_faixa" e salario_proposto > salario_atual):
- fator_utilizado: junior=0.5, pleno=1.0, senior=1.5, especialista/lideranca=2.0 (use nivel_senioridade; se ausente, use 1.0)
- custo_turnover_estimado: salario_proposto * 12 * fator_utilizado
- custo_aumento_anual: (salario_proposto - salario_atual) * 12 (se salario_atual = 0, use salario_proposto * 0.1)
- roi_multiplicador: custo_turnover_estimado / custo_aumento_anual, arredondado para 1 decimal
- interpretacao: frase curta explicando o ROI no contexto do cargo, ex: "Reter este Senior custa R$ 14.400/ano. Substituí-lo custaria R$ 126.000. ROI de aprovar: 8,7x."
- Se tipo = "ajuste_faixa" ou salario_proposto <= salario_atual, omita este campo completamente

"script_comunicacao": {
  "aprovacao": "string",
  "aprovacao_parcial": "string",
  "negativa": "string"
}
Instruções para script_comunicacao:
- Gere 3 scripts prontos para o gestor usar na conversa com o colaborador, personalizados com cargo, valores reais e contexto
- Cada script: 2-3 parágrafos, tom profissional e humano, em português
- aprovacao: script para quando a decisão foi aprovada — confirme o novo salário, reconheça a contribuição, mostre o próximo passo
- aprovacao_parcial: script para aprovação com ressalvas — seja honesto sobre o limite, explique o critério, ofereça um prazo ou marco futuro
- negativa: script para quando não foi aprovado — explique sem jargões, preserve o relacionamento, deixe porta aberta com condição clara`

// Modelos Groq em ordem de preferência
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
]

async function chamarGroq(apiKey: string, dados: string): Promise<{ texto: string; modelo: string }> {
  for (const model of GROQ_MODELS) {
    console.log(`Tentando Groq: ${model}`)
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: PROMPT_SISTEMA },
          { role: 'user', content: `Analise esta simulação de remuneração:\n\n${dados}` },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    })

    const body = await res.text()

    if (res.status === 429) {
      console.log(`${model} com limite de taxa, tentando próximo...`)
      continue
    }

    if (!res.ok) {
      throw new Error(`Groq ${res.status} (${model}): ${body.slice(0, 300)}`)
    }

    const json = JSON.parse(body)
    const texto = json.choices?.[0]?.message?.content ?? ''
    console.log(`Sucesso com Groq: ${model}`)
    return { texto, modelo: model }
  }

  throw new Error('todos_modelos_groq_indisponiveis')
}

serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    if (!token) return jsonError('Não autorizado', 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return jsonError('Token inválido', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('plano, simulacoes_usadas_mes, mes_contagem_simulacoes')
      .eq('id', user.id)
      .single()

    if (!profile) return jsonError('Perfil não encontrado', 404)

    const agora = new Date()
    const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`
    let simulacoesUsadas = profile.simulacoes_usadas_mes ?? 0
    if (profile.mes_contagem_simulacoes?.slice(0, 10) !== mesAtual) {
      simulacoesUsadas = 0
      await supabase
        .from('profiles')
        .update({ simulacoes_usadas_mes: 0, mes_contagem_simulacoes: mesAtual })
        .eq('id', user.id)
    }

    const limite = LIMITES[profile.plano] ?? 0
    if (simulacoesUsadas >= limite) {
      return jsonError(`Limite de ${limite} simulações/mês atingido.`, 429)
    }

    const formulario = await req.json()
    if (!formulario?.tipo || !formulario?.cargo_atual) return jsonError('Parâmetros inválidos', 400)

    const { data: sim, error: insertErr } = await supabase
      .from('simulacoes')
      .insert({
        user_id: user.id,
        tipo: formulario.tipo,
        cargo_atual: formulario.cargo_atual,
        cargo_proposto: formulario.cargo_proposto ?? null,
        salario_atual: Number(formulario.salario_atual) || 0,
        salario_proposto: Number(formulario.salario_proposto) || 0,
        regime: formulario.regime ?? 'clt',
        setor: formulario.setor ?? '',
        estado: formulario.estado ?? '',
        contexto_adicional: formulario.contexto_adicional ?? null,
        budget_informado: Boolean(formulario.budget_informado),
        budget_valor: formulario.budget_valor ? Number(formulario.budget_valor) : null,
        pares_existem: Boolean(formulario.pares_existem),
        salario_medio_pares: formulario.salario_medio_pares ? Number(formulario.salario_medio_pares) : null,
        historico_avaliacao: formulario.historico_avaliacao ?? null,
        politica_salarial: formulario.politica_salarial ?? null,
        nivel_senioridade: formulario.nivel_senioridade || null,
        tempo_cargo: formulario.tempo_cargo ?? null,
        status: 'processando',
        prompt_version: '8.0',
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Insert error:', JSON.stringify(insertErr))
      return jsonError(`Erro ao criar simulação: ${insertErr.message}`, 500)
    }

    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) {
      await supabase.from('simulacoes').update({ status: 'erro', erro_mensagem: 'GROQ_API_KEY não configurada' }).eq('id', sim.id)
      return jsonError('Chave da IA não configurada.', 500)
    }

    let resultado
    try {
      const { texto, modelo } = await chamarGroq(groqKey, JSON.stringify(formulario, null, 2))
      console.log(`Modelo usado: ${modelo}`)

      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error(`JSON não encontrado. Preview: ${texto.slice(0, 200)}`)
      resultado = JSON.parse(jsonMatch[0])
    } catch (e: any) {
      const erroMsg = e.message ?? 'Erro desconhecido'
      console.error('Erro IA:', erroMsg)
      await supabase.from('simulacoes').update({ status: 'erro', erro_mensagem: erroMsg.slice(0, 500) }).eq('id', sim.id)
      return jsonError('Erro ao processar com IA. Tente novamente.', 502)
    }

    await supabase.from('simulacoes').update({
      resultado, status: 'concluido', concluido_em: new Date().toISOString(),
    }).eq('id', sim.id)

    await supabase.from('profiles').update({ simulacoes_usadas_mes: simulacoesUsadas + 1 }).eq('id', user.id)

    return new Response(JSON.stringify({ id: sim.id, resultado }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  } catch (e: any) {
    console.error('Erro inesperado:', e.message)
    return jsonError(`Erro interno: ${e.message}`, 500)
  }
})

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
