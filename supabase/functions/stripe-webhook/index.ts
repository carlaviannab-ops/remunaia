import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PLANO_POR_PRICE_ID: Record<string, string> = {
  // Substitua pelos Price IDs reais do Stripe
  // price_starter_xxx: 'starter'
  // price_professional_xxx: 'professional'
  // price_enterprise_xxx: 'enterprise'
}

serve(async req => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  // Verificar assinatura do Stripe
  // Nota: Deno não tem crypto.subtle.verify nativo para HMAC-SHA256 da mesma forma,
  // então usamos a verificação manual via Web Crypto API
  let evento: any
  try {
    evento = await verificarStripeWebhook(payload, sig, webhookSecret)
  } catch (e) {
    console.error('Webhook inválido:', e)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const tipo = evento.type
  const dados = evento.data?.object

  console.log(`Stripe webhook: ${tipo}`)

  try {
    if (tipo === 'checkout.session.completed') {
      // Assinatura criada via Payment Link
      const customerId = dados.customer
      const subscriptionId = dados.subscription
      const email = dados.customer_email ?? dados.customer_details?.email

      if (!email) {
        console.warn('Email não encontrado no checkout.session')
        return new Response('OK', { status: 200 })
      }

      // Buscar usuário pelo email
      const { data: users } = await supabase.auth.admin.listUsers()
      const usuario = users?.users?.find(u => u.email === email)
      if (!usuario) {
        console.warn(`Usuário não encontrado para email: ${email}`)
        return new Response('OK', { status: 200 })
      }

      // Determinar plano pelo Price ID
      const lineItems = dados.line_items?.data ?? []
      const priceId = lineItems[0]?.price?.id ?? ''
      const plano = PLANO_POR_PRICE_ID[priceId] ?? 'starter'

      await supabase
        .from('profiles')
        .update({
          plano,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          ativo: true,
        })
        .eq('id', usuario.id)

      console.log(`Plano atualizado para ${plano}: ${usuario.id}`)
    }

    if (tipo === 'customer.subscription.updated') {
      const customerId = dados.customer
      const status = dados.status
      const priceId = dados.items?.data?.[0]?.price?.id ?? ''
      const plano = PLANO_POR_PRICE_ID[priceId] ?? 'starter'

      const ativo = ['active', 'trialing'].includes(status)

      await supabase
        .from('profiles')
        .update({ plano: ativo ? plano : 'starter', ativo })
        .eq('stripe_customer_id', customerId)

      console.log(`Subscription updated: ${customerId} → ${plano} (${status})`)
    }

    if (tipo === 'customer.subscription.deleted') {
      const customerId = dados.customer

      await supabase
        .from('profiles')
        .update({ plano: 'starter', ativo: true, stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)

      console.log(`Subscription cancelada: ${customerId}`)
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error('Erro ao processar webhook:', e)
    return new Response('Internal error', { status: 500 })
  }
})

async function verificarStripeWebhook(
  payload: string,
  sig: string,
  secret: string
): Promise<any> {
  const partes = sig.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=')
    acc[k] = v
    return acc
  }, {})

  const timestamp = partes['t']
  const assinatura = partes['v1']

  if (!timestamp || !assinatura) throw new Error('Cabeçalho stripe-signature inválido')

  const mensagem = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(mensagem))
  const hex = Array.from(new Uint8Array(mac))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (hex !== assinatura) throw new Error('Assinatura inválida')

  return JSON.parse(payload)
}
