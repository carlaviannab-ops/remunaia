import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const LIMITES: Record<string, number> = {
  starter: 30,
  professional: 150,
  enterprise: Infinity,
}

const PROMPTS: Record<string, string> = {
  promocao: `Você é um consultor sênior especialista em remuneração estratégica. Analise esta simulação de PROMOÇÃO e retorne um JSON estruturado.

DADOS: {{DADOS}}

Retorne APENAS JSON válido (sem markdown) com esta estrutura exata:
{
  "tabela_financeira": [
    {
      "componente": "string",
      "valor_atual": number,
      "valor_proposto": number,
      "variacao_percentual": number,
      "custo_total_empresa": number
    }
  ],
  "benchmark_mercado": {
    "p25": number,
    "p50": number,
    "p75": number,
    "fonte": "Pesquisa de mercado estimada (Mercer/Hay/Catho 2024)"
  },
  "equidade_interna": {
    "status": "adequado|atencao|critico",
    "posicao_relativa": "string",
    "minimo_grupo": number,
    "mediana_grupo": number,
    "maximo_grupo": number,
    "observacao": "string"
  },
  "riscos": [
    {
      "nivel": "baixo|medio|alto",
      "descricao": "string",
      "mitigacao": "string"
    }
  ],
  "recomendacao": {
    "decisao": "aprovado|aprovado_com_ressalvas|reprovado|aguardar",
    "justificativa": "string",
    "salario_sugerido": number,
    "percentual_sugerido": number,
    "proximos_passos": ["string"]
  },
  "conclusao": "string"
}`,

  aumento_salarial: `Você é um consultor sênior especialista em remuneração estratégica. Analise esta simulação de AUMENTO SALARIAL e retorne um JSON estruturado.

DADOS: {{DADOS}}

Retorne APENAS JSON válido (sem markdown) com esta estrutura exata:
{
  "tabela_financeira": [
    { "componente": "string", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number }
  ],
  "benchmark_mercado": { "p25": number, "p50": number, "p75": number, "fonte": "string" },
  "equidade_interna": { "status": "adequado|atencao|critico", "posicao_relativa": "string", "minimo_grupo": number, "mediana_grupo": number, "maximo_grupo": number, "observacao": "string" },
  "riscos": [{ "nivel": "baixo|medio|alto", "descricao": "string", "mitigacao": "string" }],
  "recomendacao": { "decisao": "aprovado|aprovado_com_ressalvas|reprovado|aguardar", "justificativa": "string", "salario_sugerido": number, "percentual_sugerido": number, "proximos_passos": ["string"] },
  "conclusao": "string"
}`,

  nova_contratacao: `Você é um consultor sênior especialista em remuneração estratégica. Analise esta simulação de NOVA CONTRATAÇÃO e retorne um JSON estruturado.

DADOS: {{DADOS}}

Retorne APENAS JSON válido (sem markdown) com esta estrutura exata:
{
  "tabela_financeira": [
    { "componente": "string", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number }
  ],
  "benchmark_mercado": { "p25": number, "p50": number, "p75": number, "fonte": "string" },
  "equidade_interna": { "status": "adequado|atencao|critico", "posicao_relativa": "string", "minimo_grupo": number, "mediana_grupo": number, "maximo_grupo": number, "observacao": "string" },
  "riscos": [{ "nivel": "baixo|medio|alto", "descricao": "string", "mitigacao": "string" }],
  "recomendacao": { "decisao": "aprovado|aprovado_com_ressalvas|reprovado|aguardar", "justificativa": "string", "salario_sugerido": number, "percentual_sugerido": null, "proximos_passos": ["string"] },
  "conclusao": "string"
}`,

  ajuste_faixa: `Você é um consultor sênior especialista em remuneração estratégica. Analise este AJUSTE DE FAIXA SALARIAL e retorne um JSON estruturado.

DADOS: {{DADOS}}

Retorne APENAS JSON válido (sem markdown) com esta estrutura exata:
{
  "tabela_financeira": [
    { "componente": "string", "valor_atual": number, "valor_proposto": number, "variacao_percentual": number, "custo_total_empresa": number }
  ],
  "benchmark_mercado": { "p25": number, "p50": number, "p75": number, "fonte": "string" },
  "equidade_interna": { "status": "adequado|atencao|critico", "posicao_relativa": "string", "minimo_grupo": number, "mediana_grupo": number, "maximo_grupo": number, "observacao": "string" },
  "riscos": [{ "nivel": "baixo|medio|alto", "descricao": "string", "mitigacao": "string" }],
  "recomendacao": { "decisao": "aprovado|aprovado_com_ressalvas|reprovado|aguardar", "justificativa": "string", "salario_sugerido": null, "percentual_sugerido": null, "proximos_passos": ["string"] },
  "conclusao": "string"
}`,
}

serve(async req => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonError('Não autorizado', 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) return jsonError('Token inválido', 401)

    // Buscar profile e verificar limite
    const { data: profile } = await supabase
      .from('profiles')
      .select('plano, simulacoes_mes')
      .eq('id', user.id)
      .single()

    if (!profile) return jsonError('Perfil não encontrado', 404)

    const limite = LIMITES[profile.plano] ?? 30
    if (profile.simulacoes_mes >= limite) {
      return jsonError(`Limite de ${limite} simulações/mês atingido. Faça upgrade do plano.`, 429)
    }

    // Parse body
    const { tipo, formulario } = await req.json()
    if (!tipo || !formulario) return jsonError('Parâmetros inválidos', 400)

    const promptTemplate = PROMPTS[tipo]
    if (!promptTemplate) return jsonError('Tipo de simulação inválido', 400)

    // Chamar Gemini
    const prompt = promptTemplate.replace('{{DADOS}}', JSON.stringify(formulario, null, 2))

    const geminiRes = await fetch(
      `${GEMINI_API_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      console.error('Gemini error:', err)
      return jsonError('Erro ao consultar IA. Tente novamente.', 502)
    }

    const geminiData = await geminiRes.json()
    const texto = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Parse JSON da resposta
    let resultado
    try {
      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('JSON não encontrado')
      resultado = JSON.parse(jsonMatch[0])
    } catch {
      console.error('Erro ao parsear JSON da IA:', texto)
      return jsonError('Resposta da IA em formato inválido. Tente novamente.', 502)
    }

    // Salvar simulação
    const { data: simulacao, error: insertErr } = await supabase
      .from('simulacoes')
      .insert({ user_id: user.id, tipo, formulario, resultado })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Erro ao salvar:', insertErr)
      return jsonError('Erro ao salvar simulação', 500)
    }

    // Incrementar contador
    await supabase
      .from('profiles')
      .update({ simulacoes_mes: profile.simulacoes_mes + 1 })
      .eq('id', user.id)

    return new Response(JSON.stringify({ id: simulacao.id, resultado }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    console.error('Erro inesperado:', e)
    return jsonError('Erro interno do servidor', 500)
  }
})

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
