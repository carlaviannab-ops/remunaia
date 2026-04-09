import { NivelRisco } from '../../types'
import { corRisco } from '../../lib/utils'

interface Props {
  nivel: NivelRisco
  texto?: string
}

const labelRisco: Record<NivelRisco, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto:  'Alto',
}

export default function Badge({ nivel, texto }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${corRisco[nivel]}`}>
      {texto ?? labelRisco[nivel]}
    </span>
  )
}
