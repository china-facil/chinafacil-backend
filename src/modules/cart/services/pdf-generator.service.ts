import { Injectable, Logger } from '@nestjs/common'
import * as puppeteer from 'puppeteer'

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name)

  private formatCurrency(value: number, currency: string = 'BRL'): string {
    const prefix = currency === 'CNY' ? '¥' : 'R$'
    return `${prefix} ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
  }

  private formatNumber(value: number, decimals: number = 0): string {
    return value.toFixed(decimals).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  private formatDate(): string {
    const now = new Date()
    return now.toLocaleDateString('pt-BR')
  }

  private formatDateTime(): string {
    const now = new Date()
    return `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  async generateTaxCalculatorSummaryPdf(data: any): Promise<Buffer> {
    const normalizedData = this.normalizeTaxCalculatorData(data)
    const html = this.generateSummaryHtml(normalizedData)
    return this.generatePdfFromHtml(html, 'landscape')
  }

  async generateTaxCalculatorDetailedPdf(data: any): Promise<Buffer> {
    const normalizedData = this.normalizeTaxCalculatorData(data)
    const html = this.generateDetailedHtml(normalizedData)
    return this.generatePdfFromHtml(html, 'portrait')
  }

  private normalizeTaxCalculatorData(dados: any): any {
    const product = dados.product || {}
    const calculation = dados.calculation || {}
    const lead = dados.lead || {}

    const quantity = product.quantity || 1
    const priceUnitBRL = product.unit_price_brl || 0
    const totalBRL = priceUnitBRL * quantity

    const yuanRate = dados.yuanRate || 0.74
    const priceUnitCNY = priceUnitBRL / yuanRate
    const totalCNY = priceUnitCNY * quantity

    const dolarRate = dados.dolarRate || 5.0

    const produtoNormalizado = {
      id: product.name || 'calculadora-produto',
      name: product.name || 'Produto da Calculadora',
      image_url: product.image_url || null,
      ncm_code: product.ncm_code || null,
      variations: [
        {
          color: { name: 'Padrão' },
          specification: { name: '' },
          price: priceUnitCNY,
          quantity: quantity,
        },
      ],
    }

    const custoImportado =
      totalBRL +
      (calculation.frete_internacional || 0) +
      (calculation.seguro || 0) +
      (calculation.tributos_import || 0) +
      (calculation.despesas_brasil || 0)

    return {
      produtos: [produtoNormalizado],
      bid: yuanRate,
      dolar: dolarRate,
      isTaxCalculator: true,
      lead: {
        name: lead.name || 'Calculadora de Impostos',
        phone: lead.phone || 'N/A',
        cnpj: lead.cnpj || 'N/A',
      },
      totalTransporteInternacional: {
        total: this.formatCurrency(calculation.frete_internacional || 0),
        totalFloat: calculation.frete_internacional || 0,
      },
      totalSeguro: {
        total: this.formatCurrency(calculation.seguro || 0),
        totalFloat: calculation.seguro || 0,
      },
      totalTributos: {
        totalText: this.formatCurrency(calculation.tributos_import || 0),
        totalByProduct: {
          [produtoNormalizado.id]: {
            ii: calculation.breakdown?.tributos?.ii || 0,
            ipi: calculation.breakdown?.tributos?.ipi || 0,
            pis: calculation.breakdown?.tributos?.pis || 0,
            cofins: calculation.breakdown?.tributos?.cofins || 0,
            icms: calculation.breakdown?.tributos?.icms || 0,
            total: calculation.tributos_import || 0,
            cifConverido: calculation.cif || totalBRL + (calculation.frete_internacional || 0) + (calculation.seguro || 0),
          },
        },
      },
      totalDespesas: {
        totalText: this.formatCurrency(calculation.despesas_brasil || 0),
        total: calculation.despesas_brasil || 0,
        vars: {
          taxaBaseSiscomex: calculation.breakdown?.despesas?.siscomex || 0,
          numAdicoes: 0,
          taxaSisComex: calculation.breakdown?.despesas?.siscomex || 0,
          taxaAwb: calculation.breakdown?.despesas?.taxa_awb || 0,
          armazenagemTerminal: calculation.breakdown?.despesas?.armazenagem || 0,
          desapachanteHOnorairios: calculation.breakdown?.despesas?.despachante || 0,
          despachanteSDA: calculation.breakdown?.despesas?.sda || 0,
          corretagemCambio: calculation.breakdown?.despesas?.corretagem || 0,
          despesas_no_brasil: calculation.despesas_brasil || 0,
        },
      },
      cif: {
        total: calculation.cif || totalBRL + (calculation.frete_internacional || 0) + (calculation.seguro || 0),
      },
      creditosImportacao: {
        total: calculation.creditos_importacao || 0,
        base_pos_credito: calculation.base_pos_credito || 0,
      },
      totalVendaProduto: {
        precoVendaGeral: calculation.preco_venda || 0,
      },
      totalSolicitacao: {
        totalFinal: custoImportado,
        totalProdutos: totalBRL,
        totalTransporteInternacional: calculation.frete_internacional || 0,
        totalSeguro: calculation.seguro || 0,
        totaltributos: calculation.tributos_import || 0,
        totalDespesas: calculation.despesas_brasil || 0,
      },
      totalVolume: calculation.totalVolume || (product.volume_un || 0) * quantity,
      totalPeso: calculation.totalWeight || (product.weight_un || 0) * quantity,
      defaultBoardingType: dados.defaultBoardingType || {
        international_shipping: 0,
        tax_bl_awb: 0,
        brazil_expenses: 0,
      },
      custoIndividualPorItem: {
        [produtoNormalizado.id]: {
          valor_produto: totalBRL,
          frete_item: calculation.frete_internacional || 0,
          seguro_item: calculation.seguro || 0,
          tributos_item: calculation.tributos_import || 0,
          despesas_item: calculation.despesas_brasil || 0,
          custo_importado: custoImportado,
          cif: calculation.cif || 0,
          creditos_item: calculation.creditos_importacao || 0,
          base_pos_credito_item: calculation.base_pos_credito || custoImportado - (calculation.creditos_importacao || 0),
          preco_venda_item: calculation.preco_venda || 0,
          preco_unitario: (calculation.preco_venda || 0) / quantity,
          quantity: quantity,
          variations: [{ preco_total: calculation.preco_venda || 0 }],
        },
      },
    }
  }

  private generateSummaryHtml(dados: any): string {
    let totalQuantidade = 0
    let totalCNY = 0
    let totalBRL = 0
    let totalFinal = 0

    let produtosRows = ''
    const produtos = dados.produtos || []
    const isTaxCalculator = dados.isTaxCalculator

    for (const produto of produtos) {
      const variations = produto.variations || []
      for (const variacao of variations) {
        const quantity = variacao.quantity || 0
        const priceUnit = variacao.price || 0
        const totalItemCNY = priceUnit * quantity
        const totalItemBRL = totalItemCNY * (dados.bid || 1)
        const priceUnitBRL = priceUnit * (dados.bid || 1)

        let valorFinalItem = 0
        if (dados.custoIndividualPorItem?.[produto.id]?.preco_venda_item) {
          valorFinalItem = dados.custoIndividualPorItem[produto.id].preco_venda_item
        } else {
          valorFinalItem = totalItemBRL
        }

        totalQuantidade += quantity
        totalCNY += totalItemCNY
        totalBRL += totalItemBRL
        totalFinal += valorFinalItem

        const imageHtml = produto.image_url
          ? `<img src="${produto.image_url}" alt="Produto" class="product-image">`
          : `<div style="width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">Sem imagem</div>`

        produtosRows += `
          <tr>
            <td>${imageHtml}</td>
            <td class="product-name">${produto.name || 'Nome não informado'}</td>
            <td>${this.formatNumber(quantity)}</td>
            ${!isTaxCalculator ? `<td class="currency-cny">${this.formatCurrency(priceUnit, 'CNY')}</td>` : ''}
            ${!isTaxCalculator ? `<td class="currency-cny">${this.formatCurrency(totalItemCNY, 'CNY')}</td>` : ''}
            <td class="currency-brl">${this.formatCurrency(priceUnitBRL)}</td>
            <td class="currency-brl">${this.formatCurrency(totalItemBRL)}</td>
            <td class="final-value">${this.formatCurrency(valorFinalItem)}</td>
          </tr>
        `
      }
    }

    const ncmDisplay = produtos[0]?.ncm_code
      ? typeof produtos[0].ncm_code === 'object'
        ? produtos[0].ncm_code.codigo || produtos[0].ncm_code.ncm || 'Identificado via IA'
        : produtos[0].ncm_code
      : 'Não informado'

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Padrão - Carrinho</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #BB1717;
        }
        .logo { max-width: 180px; }
        .title { text-align: center; flex: 1; margin: 0 20px; }
        .date { font-size: 14px; color: #666; }
        .info-section { width: 100%; margin-bottom: 30px; overflow: hidden; }
        .info-section:after { content: ""; display: table; clear: both; }
        .customer-info, .product-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
        }
        .customer-info h3, .product-info h3 { margin: 0 0 10px 0; color: #222222; font-size: 16px; }
        .customer-info p, .product-info p { margin: 3px 0; font-size: 12px; }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            font-size: 11px;
        }
        .products-table th {
            background-color: #222222;
            color: white;
            padding: 10px 6px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #dee2e6;
            font-size: 10px;
        }
        .products-table td {
            padding: 10px 6px;
            border: 1px solid #dee2e6;
            text-align: center;
            vertical-align: middle;
            font-size: 10px;
        }
        .products-table tbody tr:nth-child(even) { background-color: #fdfdfd; }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .product-name {
            text-align: left;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            font-size: 10px;
        }
        .currency-cny { color: #666; font-weight: 500; font-size: 10px; }
        .currency-brl { color: #333; font-weight: 500; font-size: 10px; }
        .total-row {
            background-color: #e9ecef !important;
            font-weight: bold;
            font-size: 10px;
        }
        .total-row td { border-top: 2px solid #BB1717; font-size: 10px; }
        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
            float: left;
            width: 44%;
            margin-left: 30px;
            box-sizing: border-box;
        }
        .notice-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
            width: 45%;
            margin-top: 15px;
            margin-right: 20px;
            box-sizing: border-box;
            font-size: 12px;
            text-align: left;
            float: left;
            clear: left;
        }
        .notice-box h3, .summary h3 { margin: 0 0 10px 0; color: #222222; font-size: 16px; }
        .notice-box p { margin: 0; color: #222222; font-weight: bold; line-height: 1.3; }
        .summary-item { display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0; font-size: 12px; }
        .summary-item.total {
            border-top: 2px solid #BB1717;
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 15px;
            padding-top: 10px;
        }
        .final-value {
            background-color: #f8f9fa !important;
            color: #333 !important;
            font-weight: bold !important;
            font-size: 10px !important;
        }
        .final-value-header { background-color: #BB1717 !important; color: white !important; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://chinafacil.com/storage/Logo.png" alt="China Fácil" class="logo">
        <div class="title">
            <h2>Cotação de Produtos</h2>
        </div>
        <div class="date">Data: ${this.formatDate()}</div>
    </div>

    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 60px;">Imagem</th>
                <th style="width: 50%;">Título</th>
                <th style="width: 50px;">Qtd</th>
                ${!isTaxCalculator ? '<th style="width: 80px;">Unit. CNY</th>' : ''}
                ${!isTaxCalculator ? '<th style="width: 80px;">Total CNY</th>' : ''}
                <th style="width: 80px;">Unit. BRL</th>
                <th style="width: 80px;">Total BRL</th>
                <th class="final-value-header" style="width: 110px;">Valor Final BRL</th>
            </tr>
        </thead>
        <tbody>
            ${produtosRows}
            <tr class="total-row">
                ${isTaxCalculator ? '<td colspan="2"><strong>TOTAL GERAL</strong></td>' : '<td colspan="2"><strong>TOTAL GERAL</strong></td>'}
                <td><strong>${this.formatNumber(totalQuantidade)}</strong></td>
                ${!isTaxCalculator ? `<td>-</td><td class="currency-cny"><strong>${this.formatCurrency(totalCNY, 'CNY')}</strong></td>` : ''}
                <td class="currency-brl"><strong>${this.formatCurrency(totalBRL)}</strong></td>
                <td class="final-value" style="font-size: 1.1em;"><strong>${this.formatCurrency(totalFinal)}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="info-section">
        <div style="float: left; width: 44%; margin-right: 30px;">
            ${isTaxCalculator ? `
            <div class="product-info" style="width: 100%; float: none; margin-right: 0; margin-bottom: 20px;">
                <h3>Informações do Produto</h3>
                <p><strong>NCM Informado:</strong> ${ncmDisplay}</p>
                <p><strong>Nome:</strong> ${produtos[0]?.name || 'Não informado'}</p>
                <p><strong>Quantidade:</strong> ${produtos[0]?.variations?.[0]?.quantity || 'N/A'}</p>
            </div>
            ` : ''}

            <div class="customer-info" style="width: 100%; float: none; margin-right: 0;">
                <h3>Informações do Cliente</h3>
                <p><strong>Nome:</strong> ${dados.lead?.name || 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${dados.lead?.phone || 'Não informado'}</p>
                <p><strong>CNPJ:</strong> ${dados.lead?.cnpj || 'Não preenchido'}</p>
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
                <span>Produtos: ${produtos.length} | Unidades: ${this.formatNumber(totalQuantidade)}</span>
                <span></span>
            </div>
            <div class="summary-item">
                <span>Cotação CNY/BRL:</span>
                <span>${this.formatNumber(dados.bid || 0, 4)}</span>
            </div>
            <div class="summary-item">
                <span>Valor Total (China):</span>
                <span>${this.formatCurrency(totalCNY, 'CNY')}</span>
            </div>
            <div class="summary-item">
                <span>Valor Total (Brasil - Básico):</span>
                <span>${this.formatCurrency(totalBRL)}</span>
            </div>
            <div class="summary-item">
                <span>Despesas no Brasil:</span>
                <span>${this.formatCurrency(dados.totalDespesas?.total || 0)}</span>
            </div>
            <div class="summary-item total">
                <span>VALOR FINAL (com impostos, frete e despesas):</span>
                <span style="color: #BB1717; font-weight: bold; font-size: 1.2em;">${this.formatCurrency(totalFinal)}</span>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  private generateDetailedHtml(dados: any): string {
    const produtos = dados.produtos || []
    let totalProdutosCNY = 0
    let totalProdutosBRL = 0
    let totalCustoIndividual = 0

    let produtosRows = ''
    for (const produto of produtos) {
      for (const variacao of produto.variations || []) {
        const totalCNY = (variacao.price || 0) * (variacao.quantity || 0)
        const totalBRL = totalCNY * (dados.bid || 1)
        const precoUnitBRL = (variacao.price || 0) * (dados.bid || 1)

        totalProdutosCNY += totalCNY
        totalProdutosBRL += totalBRL

        let valorFinalItem = 0
        if (dados.custoIndividualPorItem?.[produto.id]?.preco_venda_item) {
          valorFinalItem = dados.custoIndividualPorItem[produto.id].preco_venda_item
          totalCustoIndividual += valorFinalItem
        }

        const imageHtml = produto.image_url
          ? `<img src="${produto.image_url}" alt="${produto.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">`
          : `<div style="width: 60px; height: 60px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">Sem imagem</div>`

        produtosRows += `
          <tr>
            <td style="text-align: center; padding: 8px;">${imageHtml}</td>
            <td style="font-size: 8px;">${produto.name || 'Produto'}</td>
            <td>${this.formatNumber(variacao.quantity || 0)}</td>
            <td>${this.formatCurrency(precoUnitBRL)}</td>
            <td>${this.formatCurrency(totalBRL)}</td>
            <td><strong>${this.formatCurrency(valorFinalItem)}</strong></td>
          </tr>
        `
      }
    }

    const ncmInfo = produtos[0]?.ncm_code
      ? typeof produtos[0].ncm_code === 'object'
        ? `${produtos[0].ncm_code.codigo || produtos[0].ncm_code.ncm || 'N/A'}${produtos[0].ncm_code.nome ? ` - ${produtos[0].ncm_code.nome}` : ''}`
        : produtos[0].ncm_code
      : 'N/A'

    const tributo = dados.totalTributos?.totalByProduct?.[produtos[0]?.id] || {}
    const custoItem = dados.custoIndividualPorItem?.[produtos[0]?.id] || {}
    const despesasVars = dados.totalDespesas?.vars || {}

    const currentVolume = parseFloat(dados.totalVolume) || 0
    const currentWeight = parseFloat(dados.totalPeso) || 0

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Detalhado de Importação</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            line-height: 1.4;
            color: #1A1A1A;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            background: #1A1A1A;
            color: white;
            border-radius: 15px;
            padding: 10px 20px;
            margin-bottom: 0;
            border: 3px solid #CC3333;
        }
        .logo { max-width: 160px; margin-bottom: 15px; }
        h1 { font-weight: bold; font-size: 27px; margin: 15px 0; color: white; }
        h2 { font-weight: bold; color: #1A1A1A; font-size: 19px; margin: 25px 0 15px 0; border-bottom: 2px solid #CC3333; padding-bottom: 5px; }
        h3 { font-weight: bold; color: #1A1A1A; font-size: 15px; margin: 20px 0 10px 0; }
        .info-box { background: #f8f9fa; border: 1px solid #CC3333; border-radius: 10px; padding: 15px; margin: 15px 0; }
        .calculation-step {
            background: #ffffff;
            border: 1px solid #ddd;
            border-left: 4px solid #CC3333;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .formula {
            background: #f5f5f5;
            border-left: 4px solid #1A1A1A;
            border-radius: 5px;
            padding: 12px;
            margin: 10px 0;
            font-size: 10px;
            line-height: 1.3;
        }
        .result {
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
            font-weight: bold;
            color: #155724;
            font-size: 13px;
        }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 8px; line-height: 1.2; }
        th, td { border: 1px solid #ddd; padding: 8px 6px; text-align: left; vertical-align: top; }
        th {
            background: #1A1A1A;
            color: white;
            font-weight: bold;
            font-size: 8px;
        }
        .total-row { background: #f8f9fa; font-weight: bold; color: #1A1A1A; }
        .highlight { background: #CC3333; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold; }
        .page-break { page-break-before: always; }
        .summary-box {
            background: #1A1A1A;
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 2px solid #CC3333;
        }
        .summary-box h3 { color: #CC3333; margin-top: 0; font-size: 19px; }
        .currency { font-weight: bold; color: #CC3333; font-size: 10px; }
        .footer-info {
            background: #1A1A1A;
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer-info h3 { color: #CC3333; }
        .footer-info ul li { margin: 5px 0; font-size: 10px; }
        .company-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #CC3333;
            color: #6c757d;
            font-size: 10px;
        }
        .company-footer strong { color: #1A1A1A; }
        .product-name { font-size: 13px; font-weight: bold; color: #1A1A1A; margin: 15px 0 5px 0; }
        .ncm-info { font-size: 10px; color: #666; margin-bottom: 10px; }
        .small-text { font-size: 8px; line-height: 1.1; }
        .value-column { width: 15%; text-align: right; white-space: nowrap; }
        .tax-column { width: 12%; text-align: center; }
    </style>
</head>
<body>
    <div style="text-align: center; margin: 5px 0 10px 0;">
        <img src="https://chinafacil.com/storage/Logo.png" alt="China Fácil" style="max-width: 180px; height: auto;" />
    </div>

    <div class="header">
        <h1>Relatório Detalhado de Importação</h1>
        <p style="font-size: 15px; margin: 3px 0;"><strong>Data:</strong> ${this.formatDateTime()}</p>
    </div>

    <br><br>

    <table style="width: 100%; margin: 0; border-collapse: separate; border-spacing: 0;">
        <tr>
            <td style="width: 42%; background-color: #f8f9fa; padding: 15px; border-radius: 12px; border-left: 4px solid #CC3333; vertical-align: top;">
                <h4 style="margin: 0 0 10px 0; color: #1A1A1A; font-size: 13px;">Resumo</h4>
                <p style="margin: 5px 0; font-size: 15px; font-weight: bold; color: #CC3333;">
                    ${this.formatCurrency(totalCustoIndividual)}
                </p>
                <p style="margin: 2px 0; font-size: 11px; color: #666;">Custo total para importação</p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">Peso: ${this.formatNumber(currentWeight, 2)} kg | Volume: ${this.formatNumber(currentVolume, 2)} m³</p>
            </td>
            <td style="width: 7px; background-color: transparent; border: none;"></td>
            <td style="width: 42%; background-color: #f8f9fa; padding: 15px; border-radius: 12px; border-left: 4px solid #CC3333; vertical-align: top;">
                <h4 style="margin: 0 0 10px 0; color: #1A1A1A; font-size: 13px;">Dados do Cliente</h4>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Nome:</strong> ${dados.lead?.name || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>Telefone:</strong> ${dados.lead?.phone || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 11px;"><strong>CNPJ:</strong> ${dados.lead?.cnpj || 'Não informado'}</p>
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
                    <td><strong>${this.formatCurrency(totalProdutosBRL)}</strong></td>
                    <td><strong>${this.formatCurrency(totalCustoIndividual)}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="formula">
            <strong>Conversão CNY → BRL:</strong><br>
            ${this.formatCurrency(totalProdutosCNY, 'CNY')} × ${this.formatNumber(dados.bid || 0, 4)} =
            <span class="highlight">${this.formatCurrency(totalProdutosBRL)}</span>
        </div>
        <div class="result">✅ <strong>Valor China:</strong> ${this.formatCurrency(totalProdutosBRL)}</div>
    </div>

    <div class="calculation-step">
        <h2>Transporte Internacional</h2>
        <div class="formula">
            <strong>Frete Internacional:</strong><br>
            <span style="color: #059669; font-weight: bold;">📦 Carga Consolidada</span><br>
            <span style="font-size: 0.9em; color: #6b7280;">Volume: ${this.formatNumber(currentVolume, 2)}m³</span><br>
            Valor: <span class="highlight">${this.formatCurrency(custoItem.frete_item || 0)}</span>
        </div>
        <div class="result">✅ <strong>Frete Internacional:</strong> ${this.formatCurrency(custoItem.frete_item || 0)}</div>
    </div>

    <div class="calculation-step">
        <h2>Seguro Internacional</h2>
        <div class="formula">
            <strong>Base para Seguro:</strong><br>
            FOB + Frete = ${this.formatCurrency(totalProdutosBRL)} + ${dados.totalTransporteInternacional?.total || 'R$ 0,00'}<br>
            = <span class="highlight">${this.formatCurrency(totalProdutosBRL + (dados.totalTransporteInternacional?.totalFloat || 0))}</span>
        </div>
        <div class="formula">
            <strong>Cálculo do Seguro (0,5%):</strong><br>
            ${this.formatCurrency(totalProdutosBRL + (dados.totalTransporteInternacional?.totalFloat || 0))} × 0,5% =
            <span class="highlight">${dados.totalSeguro?.total || 'R$ 0,00'}</span>
        </div>
        <div class="result">✅ <strong>Seguro Internacional:</strong> ${dados.totalSeguro?.total || 'R$ 0,00'}</div>
    </div>

    <div class="calculation-step">
        <h2>Valor Aduaneiro (CIF)</h2>
        <div class="formula">
            <strong>CIF = FOB + Frete + Seguro</strong><br>
            CIF = ${this.formatCurrency(totalProdutosBRL)} + ${dados.totalTransporteInternacional?.total || 'R$ 0,00'} + ${dados.totalSeguro?.total || 'R$ 0,00'}<br>
            CIF = <span class="highlight">${this.formatCurrency(dados.cif?.total || 0)}</span>
        </div>
        <div class="result">✅ <strong>Valor Aduaneiro (CIF):</strong> ${this.formatCurrency(dados.cif?.total || 0)}</div>
    </div>

    <div class="page-break"></div>

    <div class="calculation-step">
        <h2>Tributos de Importação</h2>
        <div class="info-box">
            <p><strong>Cotação USD:</strong> ${this.formatCurrency(dados.dolar || 0).replace('R$', 'R$')}</p>
        </div>
        <div class="product-name">${produtos[0]?.name || 'Produto'}</div>
        <div class="ncm-info"><strong>NCM:</strong> ${ncmInfo} | <strong>CIF Produto:</strong> ${this.formatCurrency(tributo.cifConverido || 0)}</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Imposto</th>
                    <th class="tax-column">Alíquota</th>
                    <th style="width: 15%;">Base</th>
                    <th style="width: 25%;">Cálculo</th>
                    <th class="value-column">Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>II</strong><br><span class="small-text">(Imposto de Importação)</span></td>
                    <td class="tax-column">${produtos[0]?.ncm_code?.ii || 0}%</td>
                    <td>CIF</td>
                    <td class="small-text">${this.formatCurrency(tributo.cifConverido || 0)} × ${produtos[0]?.ncm_code?.ii || 0}%</td>
                    <td class="value-column currency">${this.formatCurrency(tributo.ii || 0)}</td>
                </tr>
                <tr>
                    <td><strong>IPI</strong><br><span class="small-text">(Produtos Industrializados)</span></td>
                    <td class="tax-column">${produtos[0]?.ncm_code?.ipi || 0}%</td>
                    <td class="small-text">CIF + II</td>
                    <td class="small-text">${this.formatCurrency((tributo.cifConverido || 0) + (tributo.ii || 0))} × ${produtos[0]?.ncm_code?.ipi || 0}%</td>
                    <td class="value-column currency">${this.formatCurrency(tributo.ipi || 0)}</td>
                </tr>
                <tr>
                    <td><strong>PIS</strong><br><span class="small-text">(Contribuição PIS)</span></td>
                    <td class="tax-column">${produtos[0]?.ncm_code?.pis || 0}%</td>
                    <td>CIF</td>
                    <td class="small-text">${this.formatCurrency(tributo.cifConverido || 0)} × ${produtos[0]?.ncm_code?.pis || 0}%</td>
                    <td class="value-column currency">${this.formatCurrency(tributo.pis || 0)}</td>
                </tr>
                <tr>
                    <td><strong>COFINS</strong><br><span class="small-text">(Contribuição COFINS)</span></td>
                    <td class="tax-column">${produtos[0]?.ncm_code?.cofins || 0}%</td>
                    <td>CIF</td>
                    <td class="small-text">${this.formatCurrency(tributo.cifConverido || 0)} × ${produtos[0]?.ncm_code?.cofins || 0}%</td>
                    <td class="value-column currency">${this.formatCurrency(tributo.cofins || 0)}</td>
                </tr>
                <tr>
                    <td><strong>ICMS</strong></td>
                    <td class="tax-column">4%</td>
                    <td class="small-text">Por dentro</td>
                    <td class="small-text"></td>
                    <td class="value-column currency">${this.formatCurrency(tributo.icms || 0)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4"><strong>TOTAL TRIBUTOS DO PRODUTO</strong></td>
                    <td class="value-column"><strong class="currency">${this.formatCurrency(tributo.total || 0)}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="result">✅ <strong>Total de Tributos:</strong> ${dados.totalTributos?.totalText || 'R$ 0,00'}</div>
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
                ${despesasVars.taxaSisComex > 0 ? `
                <tr>
                    <td>Taxa SISCOMEX</td>
                    <td>Base ${this.formatCurrency(despesasVars.taxaBaseSiscomex || 0)} + ${despesasVars.numAdicoes || 0} adições</td>
                    <td class="currency">${this.formatCurrency(despesasVars.taxaSisComex || 0)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Taxa BL/AWB</td>
                    <td>Taxa de conhecimento de embarque</td>
                    <td class="currency">${this.formatCurrency(despesasVars.taxaAwb || 0)}</td>
                </tr>
                <tr>
                    <td>Armazenagem</td>
                    <td>Armazenagem marítima</td>
                    <td class="currency">${this.formatCurrency(despesasVars.armazenagemTerminal || 0)}</td>
                </tr>
                <tr>
                    <td>Despachante</td>
                    <td>Honorários de despachante</td>
                    <td class="currency">${this.formatCurrency(despesasVars.desapachanteHOnorairios || 0)}</td>
                </tr>
                <tr>
                    <td>SDA</td>
                    <td>Serviços diversos alfandegários</td>
                    <td class="currency">${this.formatCurrency(despesasVars.despachanteSDA || 0)}</td>
                </tr>
                ${despesasVars.corretagemCambio > 0 ? `
                <tr>
                    <td>Corretagem de Câmbio</td>
                    <td>Taxa de câmbio</td>
                    <td class="currency">${this.formatCurrency(despesasVars.corretagemCambio || 0)}</td>
                </tr>
                ` : ''}
                ${currentVolume <= 3 ? `
                <tr>
                    <td>Despesas no Brasil</td>
                    <td>${this.formatNumber(dados.defaultBoardingType?.brazil_expenses || 0, 2)}% sobre CIF</td>
                    <td class="currency">${this.formatCurrency(despesasVars.despesas_no_brasil || 0)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td colspan="2"><strong>TOTAL DESPESAS</strong></td>
                    <td><strong class="currency">${dados.totalDespesas?.totalText || 'R$ 0,00'}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="result">✅ <strong>Total de Despesas:</strong> ${dados.totalDespesas?.totalText || 'R$ 0,00'}</div>
    </div>

    <div class="page-break"></div>

    <div class="calculation-step">
        <h2>Detalhamento do Custo Individual por Item</h2>
        <div class="product-name">${produtos[0]?.name || 'Produto'}</div>
        <div class="ncm-info"><strong>NCM:</strong> ${ncmInfo}</div>
        <table>
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
                    <td class="currency">${this.formatCurrency(custoItem.valor_produto || 0)}</td>
                    <td class="small-text">Preço em CNY convertido para BRL</td>
                </tr>
                <tr>
                    <td>Frete Internacional</td>
                    <td class="currency">${this.formatCurrency(custoItem.frete_item || 0)}</td>
                    <td class="small-text">Rateado por peso</td>
                </tr>
                <tr>
                    <td>Seguro Internacional</td>
                    <td class="currency">${this.formatCurrency(custoItem.seguro_item || 0)}</td>
                    <td class="small-text">0,5% sobre FOB + Frete</td>
                </tr>
                <tr>
                    <td>Tributos de Importação</td>
                    <td class="currency">${this.formatCurrency(custoItem.tributos_item || 0)}</td>
                    <td class="small-text">II, IPI, PIS, COFINS, ICMS</td>
                </tr>
                ${currentVolume <= 3 ? `
                <tr>
                    <td>Despesas no Brasil</td>
                    <td class="currency">${this.formatCurrency(custoItem.despesas_item || 0)}</td>
                    <td class="small-text">Siscomex, despachante, etc.</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f0f8ff;">
                    <td><strong>Custo Importado</strong></td>
                    <td class="currency"><strong>${this.formatCurrency((custoItem.valor_produto || 0) + (custoItem.frete_item || 0) + (custoItem.seguro_item || 0) + (custoItem.tributos_item || 0) + (custoItem.despesas_item || 0))}</strong></td>
                    <td class="small-text">FOB + Frete + Seguro + Tributos + Despesas</td>
                </tr>
                <tr style="color: #28a745;">
                    <td>(-) Créditos de Importação</td>
                    <td class="currency">${this.formatCurrency(custoItem.creditos_item || 0)}</td>
                    <td class="small-text">PIS, COFINS, ICMS, IPI creditáveis</td>
                </tr>
                <tr style="background-color: #fff3cd;">
                    <td><strong>Base Pós-Crédito</strong></td>
                    <td class="currency"><strong>${this.formatCurrency(custoItem.base_pos_credito_item || 0)}</strong></td>
                    <td class="small-text">Custo - Créditos</td>
                </tr>
                <tr class="total-row" style="background-color: #d4edda;">
                    <td><strong>PREÇO DE VENDA FINAL</strong></td>
                    <td class="currency"><strong>${this.formatCurrency(custoItem.preco_venda_item || 0)}</strong></td>
                    <td class="small-text">Base ÷ 0,8175 (tributos de venda)</td>
                </tr>
                <tr style="background-color: #e9ecef;">
                    <td><strong>Preço Unitário</strong></td>
                    <td class="currency"><strong>${this.formatCurrency(custoItem.preco_unitario || 0)}</strong></td>
                    <td class="small-text">Para ${custoItem.quantity || 1} unidade(s)</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="calculation-step">
        <h2>Créditos de Importação</h2>
        <div class="formula">
            <strong>Créditos Creditáveis:</strong><br>
            PIS-imp + COFINS-imp + ICMS-imp + IPI-imp<br>
            = ${this.formatCurrency(dados.creditosImportacao?.total || 0)}
        </div>
        <div class="formula">
            <strong>Base Pós-Crédito:</strong><br>
            Custo Importado - Créditos<br>
            = <span class="highlight">${this.formatCurrency(dados.creditosImportacao?.base_pos_credito || 0)}</span>
        </div>
        <div class="result">
            ✅ <strong>Créditos de Importação:</strong> ${this.formatCurrency(dados.creditosImportacao?.total || 0)}<br>
            ✅ <strong>Base Pós-Crédito:</strong> ${this.formatCurrency(dados.creditosImportacao?.base_pos_credito || 0)}
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
            Preço = ${this.formatCurrency(dados.creditosImportacao?.base_pos_credito || 0)} ÷ 0,8175<br>
            = <span class="highlight">${this.formatCurrency(dados.totalVendaProduto?.precoVendaGeral || 0)}</span>
        </div>
        <div class="result">✅ <strong>Preço de Venda Final:</strong> ${this.formatCurrency(totalCustoIndividual)}</div>
    </div>

    <div class="calculation-step">
        <h2>Custo de Importação</h2>
        <table>
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
                    <td class="currency value-column">${this.formatCurrency(dados.totalSolicitacao?.totalProdutos || 0)}</td>
                    <td class="tax-column">${this.formatNumber(((dados.totalSolicitacao?.totalProdutos || 0) / (dados.totalSolicitacao?.totalFinal || 1)) * 100, 1)}%</td>
                </tr>
                <tr>
                    <td><strong>Transporte Internacional</strong></td>
                    <td class="currency value-column">${this.formatCurrency(dados.totalSolicitacao?.totalTransporteInternacional || 0)}</td>
                    <td class="tax-column">${this.formatNumber(((dados.totalSolicitacao?.totalTransporteInternacional || 0) / (dados.totalSolicitacao?.totalFinal || 1)) * 100, 1)}%</td>
                </tr>
                <tr>
                    <td><strong>Seguro Internacional</strong></td>
                    <td class="currency value-column">${this.formatCurrency(dados.totalSolicitacao?.totalSeguro || 0)}</td>
                    <td class="tax-column">${this.formatNumber(((dados.totalSolicitacao?.totalSeguro || 0) / (dados.totalSolicitacao?.totalFinal || 1)) * 100, 1)}%</td>
                </tr>
                <tr>
                    <td><strong>Tributos</strong></td>
                    <td class="currency value-column">${this.formatCurrency(dados.totalSolicitacao?.totaltributos || 0)}</td>
                    <td class="tax-column">${this.formatNumber(((dados.totalSolicitacao?.totaltributos || 0) / (dados.totalSolicitacao?.totalFinal || 1)) * 100, 1)}%</td>
                </tr>
                ${currentVolume <= 3 ? `
                <tr>
                    <td><strong>Despesas no Brasil</strong></td>
                    <td class="currency value-column">${this.formatCurrency(dados.totalSolicitacao?.totalDespesas || 0)}</td>
                    <td class="tax-column">${this.formatNumber(((dados.totalSolicitacao?.totalDespesas || 0) / (dados.totalSolicitacao?.totalFinal || 1)) * 100, 1)}%</td>
                </tr>
                ` : ''}
            </tbody>
        </table>

        <div class="summary-box">
            <h3>PREÇO DE VENDA FINAL</h3>
            <p style="font-size: 23px; margin: 10px 0;">
                <strong>${this.formatCurrency(totalCustoIndividual)}</strong>
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 10px; margin: 10px 0; color: #856404;">
                <p style="margin: 0; font-size: 11px; font-weight: bold;">⚠️ IMPORTANTE: O custo de transporte nacional não está incluído neste cálculo e deverá ser cotado separadamente.</p>
            </div>
        </div>
    </div>

    <div class="footer-info">
        <h3>Observações Importantes</h3>
        <ul>
            <li><strong>Cotações:</strong> CNY/BRL: ${this.formatNumber(dados.bid || 0, 4)} | USD/BRL: ${this.formatNumber(dados.dolar || 0, 4)}</li>
            <li><strong>Prazo de Entrega:</strong> Aproximadamente 45-60 dias após confirmação do pedido</li>
            <li><strong>Validade:</strong> Esta cotação é válida por 7 dias</li>
            <li><strong>Documentação:</strong> Podem ser necessárias certificações adicionais conforme o produto</li>
            <li><strong>Variações:</strong> Valores podem sofrer alterações devido a flutuações cambiais</li>
        </ul>
    </div>

    <div class="company-footer">
        <p><strong>China Fácil</strong> - Simplificando sua importação</p>
        <p>www.chinafacil.com | contato@chinafacil.com</p>
        <p><em>Relatório gerado automaticamente em ${this.formatDateTime()}</em></p>
    </div>
</body>
</html>`
  }

  private async generatePdfFromHtml(html: string, orientation: 'portrait' | 'landscape'): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: orientation === 'landscape',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      })

      return Buffer.from(pdfBuffer)
    } catch (error) {
      this.logger.error('Erro ao gerar PDF:', error)
      throw error
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}

