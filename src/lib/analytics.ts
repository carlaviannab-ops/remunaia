import posthog from 'posthog-js'

const key = import.meta.env.VITE_POSTHOG_KEY

export const initAnalytics = () => {
  if (key) {
    posthog.init(key, { api_host: 'https://app.posthog.com' })
  }
}

export const track = (evento: string, props?: Record<string, unknown>) => {
  if (key) posthog.capture(evento, props)
}

export const identify = (userId: string, props?: Record<string, unknown>) => {
  if (key) posthog.identify(userId, props)
}

// Eventos padronizados
export const eventos = {
  CADASTRO:             'user_signed_up',
  LOGIN:                'user_logged_in',
  SIMULACAO_INICIADA:   'simulation_started',
  SIMULACAO_CONCLUIDA:  'simulation_completed',
  PDF_EXPORTADO:        'pdf_exported',
  UPGRADE_CLICADO:      'upgrade_clicked',
  ASSINATURA_INICIADA:  'subscription_started',
  TRIAL_EXPIRADO:       'trial_expired',
}
