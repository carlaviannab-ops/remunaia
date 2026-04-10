import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Apenas modelos confirmados disponíveis para chaves do Google AI Studio
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-lite',
]

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const LIMITES: Record<string, number> = {
  trial: 3, starter: 20, professional: 999999, enterprise: 999999, cancelado: 0,
}

const PROMPT = `Você é um consultor sênior especialista em remuneração estratégica no Brasil.
Analise a simulação abaixo e retorne APENAS JSON válido (sem markdown, sem texto extra).

DADOS DA SIMULAÇÃO:
{{DADOS}}

Estrutura obrigatória do JSON:
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
  "conclusao": "string com conclusão estratégica em português"
}`

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function chamarGemini(apiKey: string, prompt: string): Promise<{ data: any; modelUsed: string }> {
  for (const model of GEMINI_MODELS) {
    // Tenta até 2 vezes por modelo (lida com limite por minuto)
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      console.log(`Tentando: ${model} (tentativa ${tentativa})`)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      })

      const body = await res.text()

      if (res.status === 404 || res.status === 400) {
        console.log(`${model} não disponível (${res.status}), próximo...`)
        break // passa para próximo modelo
      }

      if (res.status === 429) {
        if (tentativa === 1) {
          console.log(`${model} com limite por minuto, aguardando 5s...`)
          await sleep(5000)
          continue // tenta de novo
        }
        console.log(`${model} ainda com 429 após retry, próximo modelo...`)
        break
      }

      if (!res.ok) {
        throw new Error(`Gemini ${res.status} (${model}): ${body.slice(0, 300)}`)
      }

      console.log(`Sucesso: ${model}`)
      return { data: JSON.parse(body), modelUsed: model }
    }
  }

  throw new Error('cota_diaria_esgotada')
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
        prompt_version: '5.0',
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Insert error:', JSON.stringify(insertErr))
      return jsonError(`Erro ao criar simulação: ${insertErr.message}`, 500)
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      await supabase.from('simulacoes').update({ status: 'erro', erro_mensagem: 'GEMINI_API_KEY não configurada' }).eq('id', sim.id)
      return jsonError('Chave da IA não configurada.', 500)
    }

    let resultado
    let modeloUsado = ''
    try {
      const prompt = PROMPT.replace('{{DADOS}}', JSON.stringify(formulario, null, 2))
      const { data: geminiData, modelUsed } = await chamarGemini(geminiKey, prompt)
      modeloUsado = modelUsed

      const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error(`JSON não encontrado. Preview: ${texto.slice(0, 200)}`)
      resultado = JSON.parse(jsonMatch[0])
    } catch (e: any) {
      const erroMsg = e.message ?? 'Erro desconhecido'
      console.error('Erro IA:', erroMsg)

      const msgAmigavel = erroMsg === 'cota_diaria_esgotada'
        ? 'Limite diário da IA atingido. Tente amanhã ou contate o suporte.'
        : erroMsg.slice(0, 500)

      await supabase.from('simulacoes').update({ status: 'erro', erro_mensagem: msgAmigavel }).eq('id', sim.id)
      return jsonError(
        erroMsg === 'cota_diaria_esgotada'
          ? 'Limite diário da IA atingido. Tente amanhã.'
          : 'Erro ao processar com IA. Tente novamente.',
        502
      )
    }

    await supabase.from('simulacoes').update({ resultado, status: 'concluido', concluido_em: new Date().toISOString() }).eq('id', sim.id)
    await supabase.from('profiles').update({ simulacoes_usadas_mes: simulacoesUsadas + 1 }).eq('id', user.id)

    console.log(`Simulação ${sim.id} concluída com ${modeloUsado}`)

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
