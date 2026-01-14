import { Injectable } from '@nestjs/common'
import { STANDARD_PDF_STYLES, DETAILED_PDF_STYLES } from './cart-pdf-styles.constants'

@Injectable()
export class CartPdfTemplateService {
  formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  formatInteger(value: number): string {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  getProductName(produto: any): string {
    if (produto.translated_title && produto.translated_title.trim()) {
      return produto.translated_title
    }
    if (produto.translatedName && produto.translatedName.trim()) {
      return produto.translatedName
    }
    if (produto.translated_name && produto.translated_name.trim()) {
      return produto.translated_name
    }
    if (produto.name_pt && produto.name_pt.trim()) {
      return produto.name_pt
    }
    if (produto.nome_pt && produto.nome_pt.trim()) {
      return produto.nome_pt
    }
    return produto.name || produto.title || 'Nome não informado'
  }

  generateStandardHTML(data: any): string {
    const isTaxCalculator = data.isTaxCalculator === 'true' || data.isTaxCalculator === true
    const showCNYColumns = !isTaxCalculator

    let totalQuantidade = 0
    let totalCNY = 0
    let totalBRL = 0
    let totalFinal = 0

    let produtosRows = ''
    for (const produto of data.produtos || []) {
      for (const variation of produto.variations || []) {
        const quantity = variation.quantity || 0
        const priceUnit = variation.price || 0
        const totalItemCNY = priceUnit * quantity
        const totalItemBRL = totalItemCNY * (data.bid || 1)
        const priceUnitBRL = priceUnit * (data.bid || 1)

        let valorFinalItem = totalItemBRL
        if (data.custoIndividualPorItem?.[produto.id]?.preco_venda_item) {
          valorFinalItem = data.custoIndividualPorItem[produto.id].preco_venda_item
        } else if (data.totalVendaProduto?.precoVendaGeral) {
          valorFinalItem = data.totalVendaProduto.precoVendaGeral
        }

        totalQuantidade += quantity
        totalCNY += totalItemCNY
        totalBRL += totalItemBRL
        totalFinal += valorFinalItem

        const imageUrl = produto.image_url || ''
        const imageHtml = imageUrl
          ? `<img src="${imageUrl}" alt="Produto" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
          : ''
        const placeholderHtml = imageUrl ? '' : '<div style="width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">Sem imagem</div>'

        produtosRows += `
          <tr>
            <td>
              ${imageHtml}
              ${placeholderHtml}
            </td>
            <td class="product-name">${this.escapeHtml(this.getProductName(produto))}</td>
            <td>${this.formatInteger(quantity)}</td>
            ${showCNYColumns ? `<td class="currency-cny">¥ ${this.formatNumber(priceUnit)}</td>` : ''}
            ${showCNYColumns ? `<td class="currency-cny">¥ ${this.formatNumber(totalItemCNY)}</td>` : ''}
            <td class="currency-brl">R$ ${this.formatNumber(priceUnitBRL)}</td>
            <td class="currency-brl">R$ ${this.formatNumber(totalItemBRL)}</td>
            <td class="final-value">R$ ${this.formatNumber(valorFinalItem)}</td>
          </tr>
        `
      }
    }

    const cnyTotalRow = showCNYColumns
      ? `<td>-</td><td class="currency-cny"><strong>¥ ${this.formatNumber(totalCNY)}</strong></td>`
      : ''

    const productInfoSection = isTaxCalculator && data.produtos && data.produtos.length > 0
      ? `
        <div class="product-info" style="width: 100%; float: none; margin-right: 0; margin-bottom: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #BB1717;">
          <h3>Informações do Produto</h3>
          ${(() => {
            const produto = data.produtos[0]
            const ncmCode = produto.ncm_code
            const ncmStr = typeof ncmCode === 'object' && ncmCode
              ? (ncmCode.codigo || ncmCode.ncm || 'Identificado via IA')
              : (ncmCode || 'Não informado')
            const qty = produto.variations?.[0]?.quantity || 'N/A'
            return `
              <p><strong>NCM Informado:</strong> ${this.escapeHtml(String(ncmStr))}</p>
              <p><strong>Nome:</strong> ${this.escapeHtml(this.getProductName(produto))}</p>
              <p><strong>Quantidade:</strong> ${qty}</p>
            `
          })()}
        </div>
      `
      : ''

    const totalDespesas = data.totalDespesas?.totalFloat || data.totalDespesas?.total || 0
    const totalDespesasValue = typeof totalDespesas === 'string'
      ? parseFloat(totalDespesas.replace(/[^\d,.-]/g, '').replace(',', '.'))
      : totalDespesas

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Padrão - Carrinho</title>
    <style>
        ${STANDARD_PDF_STYLES}
    </style>
</head>
<body>
    <div class="header">
        <div class="title">
            <h2>Cotação de Produtos</h2>
        </div>
        <div class="date">
            Data: ${new Date().toLocaleDateString('pt-BR')}
        </div>
    </div>

    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 60px;">Imagem</th>
                <th style="width: 50%;">Título</th>
                <th style="width: 50px;">Qtd</th>
                ${showCNYColumns ? '<th style="width: 80px;">Unit. CNY</th>' : ''}
                ${showCNYColumns ? '<th style="width: 80px;">Total CNY</th>' : ''}
                <th style="width: 80px;">Unit. BRL</th>
                <th style="width: 80px;">Total BRL</th>
                <th class="final-value-header" style="width: 110px;">Valor Final BRL</th>
            </tr>
        </thead>
        <tbody>
            ${produtosRows}
            <tr class="total-row">
                <td colspan="2"><strong>TOTAL GERAL</strong></td>
                <td><strong>${this.formatInteger(totalQuantidade)}</strong></td>
                ${cnyTotalRow}
                <td class="currency-brl"><strong>R$ ${this.formatNumber(totalBRL)}</strong></td>
                <td class="final-value" style="font-size: 1.1em;"><strong>R$ ${this.formatNumber(totalFinal)}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="info-section">
        <div style="float: left; width: 44%; margin-right: 30px;">
            ${productInfoSection}
            <div class="customer-info" style="width: 100%; float: none; margin-right: 0;">
                <h3>Informações do Cliente</h3>
                <p><strong>Nome:</strong> ${this.escapeHtml(data.lead?.name || 'Não informado')}</p>
                <p><strong>Telefone:</strong> ${this.escapeHtml(data.lead?.phone || 'Não informado')}</p>
                <p><strong>CNPJ:</strong> ${this.escapeHtml(data.lead?.cnpj || 'Não preenchido')}</p>
            </div>
            <div class="notice-box" style="width: 100%; float: none; margin-right: 0;">
                <h3>Importante</h3>
                <p style="margin: 3px 0; font-size: 14px; font-weight: normal;">
                    O valor final já inclui impostos, frete internacional e despesas de importação.
                    <span style="color: #BB1717; font-weight: bold;">Custos de transporte nacional não incluídos.</span>
                </p>
            </div>
        </div>
        <div class="summary">
            <h3>Resumo</h3>
            <div class="summary-item">
                <span>Produtos: ${data.produtos?.length || 0} | Unidades: ${this.formatInteger(totalQuantidade)}</span>
                <span></span>
            </div>
            <div class="summary-item">
                <span>Cotação CNY/BRL:</span>
                <span>${this.formatNumber(data.bid || 0, 4)}</span>
            </div>
            <div class="summary-item">
                <span>Valor Total (China):</span>
                <span>¥ ${this.formatNumber(totalCNY)}</span>
            </div>
            <div class="summary-item">
                <span>Valor Total (Brasil - Básico):</span>
                <span>R$ ${this.formatNumber(totalBRL)}</span>
            </div>
            <div class="summary-item">
                <span>Despesas no Brasil:</span>
                <span>R$ ${this.formatNumber(totalDespesasValue)}</span>
            </div>
            <div class="summary-item total">
                <span>VALOR FINAL (com impostos, frete e despesas):</span>
                <span style="color: #BB1717; font-weight: bold; font-size: 1.2em;">R$ ${this.formatNumber(totalFinal)}</span>
            </div>
        </div>
    </div>
</body>
</html>
    `
  }

  generateDetailedHTML(data: any): string {
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR')
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    let totalProdutosCNY = 0
    let totalProdutosBRL = 0
    let totalCustoIndividual = 0

    let produtosRows = ''
    for (const produto of data.produtos || []) {
      for (const variation of produto.variations || []) {
        const quantity = variation.quantity || 0
        const priceUnit = variation.price || 0
        const totalCNY = priceUnit * quantity
        const totalBRL = totalCNY * (data.bid || 1)
        const precoUnitBRL = priceUnit * (data.bid || 1)

        totalProdutosCNY += totalCNY
        totalProdutosBRL += totalBRL

        let valorFinalItem = 0
        if (data.custoIndividualPorItem?.[produto.id]) {
          const custoItem = data.custoIndividualPorItem[produto.id]
          if (custoItem.variations && Array.isArray(custoItem.variations)) {
            const variationIndex = produto.variations.findIndex((v: any) => {
              const prodColorName = v.color?.name || ''
              const prodSpecName = v.specification?.name || ''
              const prodQuantity = v.quantity || 0
              const varColorName = variation.color?.name || ''
              const varSpecName = variation.specification?.name || ''
              const varQuantity = variation.quantity || 0
              return prodColorName === varColorName && prodSpecName === varSpecName && prodQuantity === varQuantity
            })
            if (variationIndex >= 0 && custoItem.variations[variationIndex]) {
              valorFinalItem = custoItem.variations[variationIndex].preco_total || 0
            } else {
              const totalVariations = produto.variations.length
              valorFinalItem = totalVariations > 0 ? (custoItem.preco_venda_item / totalVariations) : 0
            }
          } else {
            const totalVariations = produto.variations.length
            valorFinalItem = totalVariations > 0 ? (custoItem.preco_venda_item / totalVariations) : 0
          }
          totalCustoIndividual += valorFinalItem
        }

        const imageUrl = produto.image_url || ''
        produtosRows += `
          <tr>
            <td style="text-align: center; padding: 8px;">
              ${imageUrl ? `<img src="${imageUrl}" alt="${this.escapeHtml(this.getProductName(produto))}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
              ${imageUrl ? '' : '<div style="width: 60px; height: 60px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">Sem imagem</div>'}
            </td>
            <td style="font-size: 8px;">${this.escapeHtml(this.getProductName(produto))}</td>
            <td>${this.formatInteger(quantity)}</td>
            <td>R$ ${this.formatNumber(precoUnitBRL)}</td>
            <td>R$ ${this.formatNumber(totalBRL)}</td>
            <td><strong>R$ ${this.formatNumber(valorFinalItem)}</strong></td>
          </tr>
        `
      }
    }

    const currentVolume = parseFloat(String(data.totalVolume || 0))
    const currentWeight = parseFloat(String(data.totalPeso || 0))
    const isVolumeOver25m3 = currentVolume > 25
    const isWeightOver27Tons = currentWeight >= 27000
    const useFCL = isVolumeOver25m3 || isWeightOver27Tons

    let freteTotalUSD = 0
    let tipoEmbarque = ''
    if (useFCL) {
      freteTotalUSD = 4100
      tipoEmbarque = isWeightOver27Tons && !isVolumeOver25m3 ? 'Container FCL (Peso ≥ 27t)' : 'Frete Marítimo Consolidado'
    } else {
      const rawFreteValue = data.defaultBoardingType?.international_shipping || 0
      const freteUSDPerM3 = parseFloat(String(rawFreteValue).replace(',', '.'))
      freteTotalUSD = freteUSDPerM3 * currentVolume
      tipoEmbarque = 'Carga Consolidada Aérea/Marítima'
    }

    const primeiroItem = data.custoIndividualPorItem ? Object.values(data.custoIndividualPorItem)[0] as any : null
    const freteCorreto = primeiroItem?.frete_item || 0

    const totalTransporteInternacional = data.totalTransporteInternacional?.totalFloat || 0
    const totalSeguro = data.totalSeguro?.totalFloat || 0
    const cifTotal = data.cif?.total || 0
    const dolar = parseFloat(String(data.dolar || 0))

    let totalValorFinalCabecalho = 0
    if (data.produtos) {
      for (const produto of data.produtos) {
        if (data.custoIndividualPorItem?.[produto.id]) {
          totalValorFinalCabecalho += data.custoIndividualPorItem[produto.id].preco_venda_item || 0
        }
      }
    }

    let tributosRows = ''
    for (const produto of data.produtos || []) {
      const tributoData = data.totalTributos?.totalByProduct?.[produto.id] || {}
      const tributo = {
        cifConverido: tributoData.cifConverido || 0,
        ii: tributoData.ii || 0,
        ipi: tributoData.ipi || 0,
        pis: tributoData.pis || 0,
        cofins: tributoData.cofins || 0,
        icms: tributoData.icms || 0,
        total: tributoData.total || 0,
      }

      const ncmCode = produto.ncm_code
      const ncmStr = typeof ncmCode === 'object' && ncmCode
        ? ((ncmCode.codigo || ncmCode.ncm || 'N/A') + (ncmCode.nome || ncmCode.descricao ? ' - ' + (ncmCode.nome || ncmCode.descricao) : ''))
        : (ncmCode || 'N/A')

      const ii = typeof ncmCode === 'object' && ncmCode 
        ? (ncmCode.ii !== undefined && ncmCode.ii !== null ? String(ncmCode.ii) : '0')
        : '0'
      const ipi = typeof ncmCode === 'object' && ncmCode 
        ? (ncmCode.ipi !== undefined && ncmCode.ipi !== null ? String(ncmCode.ipi) : '0')
        : '0'
      const pis = typeof ncmCode === 'object' && ncmCode 
        ? (ncmCode.pis !== undefined && ncmCode.pis !== null ? String(ncmCode.pis) : '0')
        : '0'
      const cofins = typeof ncmCode === 'object' && ncmCode 
        ? (ncmCode.cofins !== undefined && ncmCode.cofins !== null ? String(ncmCode.cofins) : '0')
        : '0'

      tributosRows += `
        <div class="product-name">${this.escapeHtml(this.getProductName(produto))}</div>
        <div class="ncm-info"><strong>NCM:</strong> ${this.escapeHtml(String(ncmStr))} | <strong>CIF Produto:</strong> R$ ${this.formatNumber(tributo.cifConverido)}</div>
        <table class="compact-table">
          <thead>
            <tr>
              <th style="width: 30%;">Imposto</th>
              <th class="tax-column">Alíquota</th>
              <th class="base-column">Base</th>
              <th class="calc-column">Cálculo</th>
              <th class="value-column">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>II</strong><br><span class="small-text">(Imposto de Importação)</span></td>
              <td class="tax-column no-break">${ii}%</td>
              <td class="base-column">CIF</td>
              <td class="calc-column small-text">R$ ${this.formatInteger(tributo.cifConverido)} × ${ii}%</td>
              <td class="value-column currency no-break">R$ ${this.formatNumber(tributo.ii)}</td>
            </tr>
            <tr>
              <td><strong>IPI</strong><br><span class="small-text">(Produtos Industrializados)</span></td>
              <td class="tax-column no-break">${ipi}%</td>
              <td class="base-column small-text">CIF + II</td>
              <td class="calc-column small-text">R$ ${this.formatInteger(tributo.cifConverido + tributo.ii)} × ${ipi}%</td>
              <td class="value-column currency no-break">R$ ${this.formatNumber(tributo.ipi)}</td>
            </tr>
            <tr>
              <td><strong>PIS</strong><br><span class="small-text">(Contribuição PIS)</span></td>
              <td class="tax-column no-break">${pis}%</td>
              <td class="base-column">CIF</td>
              <td class="calc-column small-text">R$ ${this.formatInteger(tributo.cifConverido)} × ${pis}%</td>
              <td class="value-column currency no-break">R$ ${this.formatNumber(tributo.pis)}</td>
            </tr>
            <tr>
              <td><strong>COFINS</strong><br><span class="small-text">(Contribuição COFINS)</span></td>
              <td class="tax-column no-break">${cofins}%</td>
              <td class="base-column">CIF</td>
              <td class="calc-column small-text">R$ ${this.formatInteger(tributo.cifConverido)} × ${cofins}%</td>
              <td class="value-column currency no-break">R$ ${this.formatNumber(tributo.cofins)}</td>
            </tr>
            <tr>
              <td><strong>ICMS</strong></td>
              <td class="tax-column no-break">4%</td>
              <td class="base-column small-text">Por dentro</td>
              <td class="calc-column small-text"></td>
              <td class="value-column currency no-break">R$ ${this.formatNumber(tributo.icms)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4"><strong>TOTAL TRIBUTOS DO PRODUTO</strong></td>
              <td class="value-column"><strong class="currency no-break">R$ ${this.formatNumber(tributo.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      `
    }

    const totalDespesas = data.totalDespesas?.totalFloat || data.totalDespesas?.total || 0
    const totalDespesasValue = typeof totalDespesas === 'string'
      ? parseFloat(totalDespesas.replace(/[^\d,.-]/g, '').replace(',', '.'))
      : totalDespesas

    const vars = data.totalDespesas?.vars || {}
    const despesasRows = `
      ${vars.taxaSisComex > 0 ? `
        <tr>
          <td>Taxa SISCOMEX</td>
          <td>Base R$ ${this.formatNumber(vars.taxaBaseSiscomex || 0)} + ${vars.numAdicoes || 0} adições</td>
          <td class="currency">R$ ${this.formatNumber(vars.taxaSisComex || 0)}</td>
        </tr>
      ` : ''}
      <tr>
        <td>Taxa BL/AWB</td>
        <td>Taxa de conhecimento de embarque</td>
        <td class="currency">R$ ${this.formatNumber(vars.taxaAwb || 0)}</td>
      </tr>
      <tr>
        <td>Armazenagem</td>
        <td>Armazenagem marítima</td>
        <td class="currency">R$ ${this.formatNumber(vars.armazenagemTerminal || 0)}</td>
      </tr>
      <tr>
        <td>Despachante</td>
        <td>Honorários de despachante</td>
        <td class="currency">R$ ${this.formatNumber(vars.desapachanteHOnorairios || 0)}</td>
      </tr>
      <tr>
        <td>SDA</td>
        <td>Serviços diversos alfandegários</td>
        <td class="currency">R$ ${this.formatNumber(vars.despachanteSDA || 0)}</td>
      </tr>
      ${vars.corretagemCambio > 0 ? `
        <tr>
          <td>Corretagem de Câmbio</td>
          <td>Taxa de câmbio</td>
          <td class="currency">R$ ${this.formatNumber(vars.corretagemCambio || 0)}</td>
        </tr>
      ` : ''}
      ${currentVolume <= 3 ? `
        <tr>
          <td>Despesas no Brasil</td>
          <td>${this.formatNumber(data.defaultBoardingType?.brazil_expenses || 0)}% sobre CIF</td>
          <td class="currency">R$ ${this.formatNumber(vars.despesas_no_brasil || 0)}</td>
        </tr>
      ` : ''}
    `

    let custoIndividualRows = ''
    if (data.custoIndividualPorItem) {
      for (const produto of data.produtos || []) {
        const custoItem = data.custoIndividualPorItem[produto.id]
        if (custoItem) {
          const ncmCode = produto.ncm_code
          const ncmStr = typeof ncmCode === 'object' && ncmCode
            ? ((ncmCode.codigo || ncmCode.ncm || 'N/A') + (ncmCode.nome || ncmCode.descricao ? ' - ' + (ncmCode.nome || ncmCode.descricao) : ''))
            : (ncmCode || 'N/A')

          const custoImportado = (custoItem.valor_produto || 0) + (custoItem.frete_item || 0) + (custoItem.seguro_item || 0) + (custoItem.tributos_item || 0) + (custoItem.despesas_item || 0)

          custoIndividualRows += `
            <div class="product-name">${this.escapeHtml(this.getProductName(produto))}</div>
            <div class="ncm-info"><strong>NCM:</strong> ${this.escapeHtml(String(ncmStr))}</div>
            <table class="compact-table">
              <thead>
                <tr>
                  <th>Componente do Custo</th>
                  <th>Valor (R$)</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Valor do Produto (FOB)</td>
                  <td class="currency">R$ ${this.formatNumber(custoItem.valor_produto || 0)}</td>
                  <td class="small-text">Preço em CNY convertido para BRL</td>
                </tr>
                <tr>
                  <td>Frete Internacional</td>
                  <td class="currency">R$ ${this.formatNumber(custoItem.frete_item || 0)}</td>
                  <td class="small-text">Rateado por peso</td>
                </tr>
                <tr>
                  <td>Seguro Internacional</td>
                  <td class="currency">R$ ${this.formatNumber(custoItem.seguro_item || 0)}</td>
                  <td class="small-text">0,5% sobre FOB + Frete</td>
                </tr>
                <tr>
                  <td>Tributos de Importação</td>
                  <td class="currency">R$ ${this.formatNumber(custoItem.tributos_item || 0)}</td>
                  <td class="small-text">II, IPI, PIS, COFINS, ICMS</td>
                </tr>
                ${currentVolume <= 3 ? `
                  <tr>
                    <td>Despesas no Brasil</td>
                    <td class="currency">R$ ${this.formatNumber(custoItem.despesas_item || 0)}</td>
                    <td class="small-text">Siscomex, despachante, etc.</td>
                  </tr>
                ` : ''}
                <tr style="background-color: #f0f8ff;">
                  <td><strong>Custo Importado</strong></td>
                  <td class="currency"><strong>R$ ${this.formatNumber(custoImportado)}</strong></td>
                  <td class="small-text">FOB + Frete + Seguro + Tributos + Despesas</td>
                </tr>
                <tr style="color: #28a745;">
                  <td>(-) Créditos de Importação</td>
                  <td class="currency">R$ ${this.formatNumber(custoItem.creditos_item || 0)}</td>
                  <td class="small-text">PIS, COFINS, ICMS, IPI creditáveis</td>
                </tr>
                <tr style="background-color: #fff3cd;">
                  <td><strong>Base Pós-Crédito</strong></td>
                  <td class="currency"><strong>R$ ${this.formatNumber(custoItem.base_pos_credito_item || 0)}</strong></td>
                  <td class="small-text">Custo - Créditos</td>
                </tr>
                <tr class="total-row" style="background-color: #d4edda;">
                  <td><strong>PREÇO DE VENDA FINAL</strong></td>
                  <td class="currency"><strong>R$ ${this.formatNumber(custoItem.preco_venda_item || 0)}</strong></td>
                  <td class="small-text">Base ÷ 0,8175 (tributos de venda)</td>
                </tr>
                <tr style="background-color: #e9ecef;">
                  <td><strong>Preço Unitário</strong></td>
                  <td class="currency"><strong>R$ ${this.formatNumber(custoItem.preco_unitario || 0)}</strong></td>
                  <td class="small-text">Para ${custoItem.quantity || 0} unidade(s)</td>
                </tr>
              </tbody>
            </table>
          `
        }
      }
    }

    const creditosTotal = data.creditosImportacao?.total || 0
    const basePosCredito = data.creditosImportacao?.base_pos_credito || 0
    const precoVendaGeral = data.totalVendaProduto?.precoVendaGeral || 0

    const totalSolicitacao = data.totalSolicitacao || {}
    const totalFinal = totalSolicitacao.totalFinal || 0

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Detalhado de Importação</title>
    <style>
        ${DETAILED_PDF_STYLES}
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório Detalhado de Importação</h1>
        <p style="font-size: 15px; margin: 3px 0;"><strong>Data:</strong> ${dateStr} ${timeStr}</p>
    </div>

    <br style="line-height: 10px;">
    <br style="line-height: 10px;">

    <table style="width: 100%; margin: 0; border-collapse: separate; border-spacing: 0;">
        <tr>
            <td style="width: 42%; background-color: #f8f9fa; padding: 15px; border-radius: 12px; border-left: 4px solid #CC3333; vertical-align: top;">
                <h4 style="margin: 0 0 10px 0; color: #1A1A1A; font-size: 13px;">Resumo</h4>
                <p style="margin: 5px 0; font-size: 15px; font-weight: bold; color: #CC3333;">R$ ${this.formatNumber(totalValorFinalCabecalho)}</p>
                <p style="margin: 2px 0; font-size: 11px; color: #666;">Custo total para importação</p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">Peso: ${this.formatNumber(currentWeight, 2)} kg | Volume: ${this.formatNumber(currentVolume, 2)} m³</p>
            </td>
            <td style="width: 7px; background-color: transparent; border: none;"></td>
            <td style="width: 42%; background-color: #f8f9fa; padding: 15px; border-radius: 12px; border-left: 4px solid #CC3333; vertical-align: top;">
                <h4 style="margin: 0 0 10px 0; color: #1A1A1A; font-size: 13px;">Dados do Cliente</h4>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Nome:</strong> ${this.escapeHtml(data.lead?.name || 'Não informado')}</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Telefone:</strong> ${this.escapeHtml(data.lead?.phone || 'Não informado')}</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>CNPJ:</strong> ${this.escapeHtml(data.lead?.cnpj || 'Não informado')}</p>
            </td>
        </tr>
    </table>

    <div style="height: 10px;"></div>

    <div class="calculation-step">
        <h2>Valor dos Produtos na China</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 80px;">Imagem</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit. (BRL)</th>
                    <th>Total (BRL)</th>
                    <th>Valor Final<br>(com encargos)</th>
                </tr>
            </thead>
            <tbody>
                ${produtosRows}
                <tr class="total-row">
                    <td colspan="3"><strong>TOTAL DOS PRODUTOS</strong></td>
                    <td><strong>-</strong></td>
                    <td><strong>R$ ${this.formatNumber(totalProdutosBRL)}</strong></td>
                    <td><strong>R$ ${this.formatNumber(totalCustoIndividual)}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="formula">
            <strong>Conversão CNY → BRL:</strong><br>
            ¥ ${this.formatNumber(totalProdutosCNY)} × ${this.formatNumber(data.bid || 0, 4)} = <span class="highlight">R$ ${this.formatNumber(totalProdutosBRL)}</span>
        </div>
        <div class="result">
            ✅ <strong>Valor China:</strong> R$ ${this.formatNumber(totalProdutosBRL)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Transporte Internacional</h2>
        <div class="formula">
            <strong>Frete Internacional:</strong><br>
            ${useFCL ? `
                <span style="color: #059669; font-weight: bold;">🚢 ${tipoEmbarque}</span><br>
                <span style="font-size: 0.9em; color: #6b7280;">Peso: ${this.formatInteger(currentWeight)}kg | Volume: ${this.formatNumber(currentVolume, 2)}m³</span><br>
                ${isWeightOver27Tons && !isVolumeOver25m3 ? '<span style="font-size: 0.8em; color: #dc2626; font-style: italic;">*Valor fixo do container (25-67m³)</span><br>' : ''}
                Valor fixo do container: $ ${this.formatNumber(4100)}<br>
                Conversão: $ ${this.formatNumber(4100)} × ${this.formatNumber(dolar, 2)} = R$ ${this.formatNumber(freteCorreto)}
            ` : `
                <span style="color: #059669; font-weight: bold;">📦 ${tipoEmbarque}</span><br>
                <span style="font-size: 0.9em; color: #6b7280;">Volume: ${this.formatNumber(currentVolume, 2)}m³</span><br>
                Taxa por m³: $ ${this.formatNumber(parseFloat(String(data.defaultBoardingType?.international_shipping || 0).replace(',', '.')), 2)}/m³ × ${this.formatNumber(currentVolume, 2)}m³ = $ ${this.formatNumber(freteTotalUSD, 2)}<br>
                Conversão: $ ${this.formatNumber(freteTotalUSD, 2)} × ${this.formatNumber(dolar, 2)} = R$ ${this.formatNumber(freteCorreto)}
            `}
        </div>
        <div class="result">
            ✅ <strong>Frete Internacional:</strong> R$ ${this.formatNumber(freteCorreto)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Seguro Internacional</h2>
        <div class="formula">
            <strong>Base para Seguro:</strong><br>
            FOB + Frete = R$ ${this.formatNumber(totalProdutosBRL)} + R$ ${this.formatNumber(totalTransporteInternacional)}<br>
            = <span class="highlight">R$ ${this.formatNumber(totalProdutosBRL + totalTransporteInternacional)}</span>
        </div>
        <div class="formula">
            <strong>Cálculo do Seguro (0,5%):</strong><br>
            R$ ${this.formatNumber(totalProdutosBRL + totalTransporteInternacional)} × 0,5% = <span class="highlight">${data.totalSeguro?.total || 'R$ ' + this.formatNumber(totalSeguro)}</span>
        </div>
        <div class="result">
            ✅ <strong>Seguro Internacional:</strong> ${data.totalSeguro?.total || 'R$ ' + this.formatNumber(totalSeguro)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Valor Aduaneiro (CIF)</h2>
        <div class="formula">
            <strong>CIF = FOB + Frete + Seguro</strong><br>
            CIF = R$ ${this.formatNumber(totalProdutosBRL)} + R$ ${this.formatNumber(totalTransporteInternacional)} + ${data.totalSeguro?.total || 'R$ ' + this.formatNumber(totalSeguro)}<br>
            CIF = <span class="highlight">R$ ${this.formatNumber(cifTotal)}</span>
        </div>
        <div class="result">
            ✅ <strong>Valor Aduaneiro (CIF):</strong> R$ ${this.formatNumber(cifTotal)}
        </div>
    </div>

    <div class="page-break"></div>

    <div class="calculation-step">
        <h2>Tributos de Importação</h2>
        <div class="info-box">
            <p><strong>Cotação USD:</strong> R$ ${this.formatNumber(dolar, 4)}</p>
        </div>
        ${tributosRows}
        <div class="result">
            ✅ <strong>Total de Tributos:</strong> ${data.totalTributos?.totalText || 'R$ ' + this.formatNumber(data.totalTributos?.total || 0)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Custos Operacionais no Brasil</h2>
        <table>
            <thead>
                <tr>
                    <th>Tipo de Despesa</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${despesasRows}
                <tr class="total-row">
                    <td colspan="2"><strong>TOTAL DESPESAS</strong></td>
                    <td><strong class="currency">${data.totalDespesas?.totalText || 'R$ ' + this.formatNumber(totalDespesasValue)}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="result">
            ✅ <strong>Total de Despesas:</strong> ${data.totalDespesas?.totalText || 'R$ ' + this.formatNumber(totalDespesasValue)}
        </div>
    </div>

    <div class="page-break"></div>

    ${custoIndividualRows ? `
    <div class="calculation-step">
        <h2>Detalhamento do Custo Individual por Item</h2>
        ${custoIndividualRows}
    </div>
    ` : ''}

    <div class="calculation-step">
        <h2>Créditos de Importação</h2>
        <div class="formula">
            <strong>Créditos Creditáveis:</strong><br>
            PIS-imp + COFINS-imp + ICMS-imp + IPI-imp<br>
            = R$ ${this.formatNumber(creditosTotal)}
        </div>
        <div class="formula">
            <strong>Base Pós-Crédito:</strong><br>
            Custo Importado - Créditos<br>
            = <span class="highlight">R$ ${this.formatNumber(basePosCredito)}</span>
        </div>
        <div class="result">
            ✅ <strong>Créditos de Importação:</strong> R$ ${this.formatNumber(creditosTotal)}<br>
            ✅ <strong>Base Pós-Crédito:</strong> R$ ${this.formatNumber(basePosCredito)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Preço de Venda Final</h2>
        <div class="info-box">
            <p><strong>Tributos de Venda:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>PIS + COFINS: 9,25%</li>
                <li>ICMS: 4%</li>
                <li>Taxa Administrativa: 5%</li>
                <li><strong>Total: 18,25%</strong></li>
            </ul>
            <p><strong>Denominador:</strong> 1 - 18,25% = 81,75%</p>
        </div>
        <div class="formula">
            <strong>Preço de Venda = Base Pós-Crédito ÷ 0,8175</strong><br>
            Preço = R$ ${this.formatNumber(basePosCredito)} ÷ 0,8175<br>
            = <span class="highlight">R$ ${this.formatNumber(precoVendaGeral)}</span>
        </div>
        <div class="result">
            ✅ <strong>Preço de Venda Final:</strong> R$ ${this.formatNumber(totalValorFinalCabecalho)}
        </div>
    </div>

    <div class="calculation-step">
        <h2>Custo de Importação</h2>
        <table class="compact-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Componente</th>
                    <th class="value-column">Valor</th>
                    <th class="tax-column">% do Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Produtos (Valor China)</strong></td>
                    <td class="currency value-column no-break">R$ ${this.formatNumber(totalSolicitacao.totalProdutos || 0)}</td>
                    <td class="tax-column">${totalFinal > 0 ? this.formatNumber(((totalSolicitacao.totalProdutos || 0) / totalFinal) * 100, 1) : '0,0'}%</td>
                </tr>
                <tr>
                    <td><strong>Transporte Internacional</strong></td>
                    <td class="currency value-column no-break">R$ ${this.formatNumber(totalSolicitacao.totalTransporteInternacional || 0)}</td>
                    <td class="tax-column">${totalFinal > 0 ? this.formatNumber(((totalSolicitacao.totalTransporteInternacional || 0) / totalFinal) * 100, 1) : '0,0'}%</td>
                </tr>
                <tr>
                    <td><strong>Seguro Internacional</strong></td>
                    <td class="currency value-column no-break">R$ ${this.formatNumber(totalSolicitacao.totalSeguro || 0)}</td>
                    <td class="tax-column">${totalFinal > 0 ? this.formatNumber(((totalSolicitacao.totalSeguro || 0) / totalFinal) * 100, 1) : '0,0'}%</td>
                </tr>
                <tr>
                    <td><strong>Tributos</strong></td>
                    <td class="currency value-column no-break">R$ ${this.formatNumber(totalSolicitacao.totaltributos || 0)}</td>
                    <td class="tax-column">${totalFinal > 0 ? this.formatNumber(((totalSolicitacao.totaltributos || 0) / totalFinal) * 100, 1) : '0,0'}%</td>
                </tr>
                ${currentVolume <= 3 ? `
                    <tr>
                        <td><strong>Despesas no Brasil</strong></td>
                        <td class="currency value-column no-break">R$ ${this.formatNumber(totalSolicitacao.totalDespesas || 0)}</td>
                        <td class="tax-column">${totalFinal > 0 ? this.formatNumber(((totalSolicitacao.totalDespesas || 0) / totalFinal) * 100, 1) : '0,0'}%</td>
                    </tr>
                ` : ''}
            </tbody>
        </table>
        <div class="summary-box">
            <h3>PREÇO DE VENDA FINAL</h3>
            <p style="font-size: 23px; margin: 10px 0;"><strong>R$ ${this.formatNumber(totalValorFinalCabecalho)}</strong></p>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 10px; margin: 10px 0; color: #856404;">
                <p style="margin: 0; font-size: 11px; font-weight: bold;">⚠️ IMPORTANTE: O custo de transporte nacional não está incluído neste cálculo e deverá ser cotado separadamente.</p>
            </div>
        </div>
    </div>

    <div class="info-box" style="background: #1A1A1A; color: white;">
        <h3 style="color: #CC3333;">Observações Importantes</h3>
        <ul style="margin: 5px 0; padding-left: 20px;">
            <li><strong>Cotações:</strong> CNY/BRL: ${this.formatNumber(data.bid || 0, 4)} | USD/BRL: ${this.formatNumber(dolar, 4)}</li>
            <li><strong>Prazo de Entrega:</strong> Aproximadamente 45-60 dias após confirmação do pedido</li>
            <li><strong>Validade:</strong> Esta cotação é válida por 7 dias</li>
            <li><strong>Documentação:</strong> Podem ser necessárias certificações adicionais conforme o produto</li>
            <li><strong>Variações:</strong> Valores podem sofrer alterações devido a flutuações cambiais</li>
        </ul>
    </div>

    <div class="company-footer">
        <p><strong>China Fácil</strong> - Simplificando sua importação</p>
        <p>www.chinafacil.com | contato@chinafacil.com</p>
        <p><em>Relatório gerado automaticamente em ${dateStr} ${timeStr}</em></p>
    </div>
</body>
</html>
    `
  }
}

