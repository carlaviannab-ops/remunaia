import jsPDF from 'jspdf'
import { formatarMoeda, formatarPorcentagem, formatarData, labelTipo } from './utils'
import type { Simulacao } from '../types'

export function gerarPDF(simulacao: Simulacao): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const resultado = simulacao.resultado
  const f = simulacao.formulario

  const largura = doc.internal.pageSize.getWidth()
  let y = 20

  function linha(texto: string, tamanho = 10, negrito = false, cor: [number, number, number] = [30, 30, 30]) {
    doc.setFontSize(tamanho)
    doc.setFont('helvetica', negrito ? 'bold' : 'normal')
    doc.setTextColor(...cor)
    doc.text(texto, 20, y)
    y += tamanho * 0.5 + 2
  }

  function divisor() {
    doc.setDrawColor(220, 220, 220)
    doc.line(20, y, largura - 20, y)
    y += 6
  }

  function secao(titulo: string) {
    y += 4
    divisor()
    linha(titulo, 12, true, [30, 86, 160])
    y += 2
  }

  function novaPaginaSe(espaco = 30) {
    if (y + espaco > 270) {
      doc.addPage()
      y = 20
    }
  }

  // Cabeçalho
  doc.setFillColor(30, 86, 160)
  doc.rect(0, 0, largura, 14, 'F')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('RemunaIA — Relatório de Simulação', 20, 9.5)
  y = 24

  // Título
  linha(`${labelTipo[simulacao.tipo]} — ${f.cargo}`, 16, true, [20, 20, 20])
  linha(`Gerado em ${formatarData(simulacao.created_at)}`, 9, false, [120, 120, 120])
  y += 2

  // Cenário
  secao('Cenário Simulado')
  const campos = [
    ['Tipo', labelTipo[simulacao.tipo]],
    f.colaborador ? ['Colaborador', f.colaborador] : null,
    ['Cargo', f.cargo],
    ['Nível', f.nivel],
    f.salario_atual != null ? ['Salário atual', formatarMoeda(f.salario_atual)] : null,
    f.area ? ['Área', f.area] : null,
    f.localizacao ? ['Localização', f.localizacao] : null,
  ].filter(Boolean) as [string, string][]

  campos.forEach(([chave, valor]) => {
    novaPaginaSe(10)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(`${chave}:`, 20, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text(valor, 70, y)
    y += 7
  })

  // Impacto financeiro
  if (resultado.tabela_financeira?.length) {
    novaPaginaSe(50)
    secao('Impacto Financeiro')

    const headers = ['Componente', 'Atual', 'Proposto', 'Variação', 'Custo/ano']
    const colWidths = [55, 30, 30, 25, 35]
    const colX = [20, 75, 105, 135, 158]

    doc.setFillColor(240, 245, 255)
    doc.rect(20, y - 2, largura - 40, 8, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    headers.forEach((h, i) => doc.text(h, colX[i], y + 4))
    y += 10

    resultado.tabela_financeira.forEach(item => {
      novaPaginaSe(10)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(item.componente, colX[0], y, { maxWidth: colWidths[0] })
      doc.text(formatarMoeda(item.valor_atual), colX[1], y)
      doc.text(formatarMoeda(item.valor_proposto), colX[2], y)
      doc.text(
        `${item.variacao_percentual >= 0 ? '+' : ''}${formatarPorcentagem(item.variacao_percentual)}`,
        colX[3],
        y
      )
      doc.text(formatarMoeda(item.custo_total_empresa), colX[4], y)
      y += 7
    })
  }

  // Benchmark
  if (resultado.benchmark_mercado) {
    novaPaginaSe(35)
    secao('Benchmark de Mercado')
    const bm = resultado.benchmark_mercado
    linha(`Fonte: ${bm.fonte}`, 9, false, [100, 100, 100])
    y += 2
    ;[
      ['P25 (abaixo do mercado)', formatarMoeda(bm.p25)],
      ['P50 (mediana de mercado)', formatarMoeda(bm.p50)],
      ['P75 (acima do mercado)', formatarMoeda(bm.p75)],
    ].forEach(([chave, valor]) => {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(80, 80, 80)
      doc.text(`${chave}:`, 20, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(valor, 90, y)
      y += 7
    })
  }

  // Recomendação
  if (resultado.recomendacao) {
    novaPaginaSe(50)
    secao('Recomendação da IA')
    const rec = resultado.recomendacao
    linha(rec.decisao.replace(/_/g, ' ').toUpperCase(), 11, true, [30, 86, 160])
    y += 2

    const linhasJust = doc.splitTextToSize(rec.justificativa, largura - 40)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    linhasJust.forEach((l: string) => {
      novaPaginaSe(8)
      doc.text(l, 20, y)
      y += 6
    })

    if (rec.salario_sugerido != null) {
      y += 2
      linha(`Salário sugerido: ${formatarMoeda(rec.salario_sugerido)}`, 10, true, [20, 120, 60])
    }

    if (rec.proximos_passos?.length) {
      y += 4
      linha('Próximos passos:', 10, true)
      rec.proximos_passos.forEach(p => {
        novaPaginaSe(8)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        doc.text(`• ${p}`, 24, y)
        y += 6
      })
    }
  }

  // Rodapé
  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text(
      `RemunaIA · Simulação confidencial · Página ${i} de ${totalPaginas}`,
      largura / 2,
      287,
      { align: 'center' }
    )
  }

  doc.save(`RemunaIA_${simulacao.tipo}_${f.cargo.replace(/\s+/g, '_')}.pdf`)
}
