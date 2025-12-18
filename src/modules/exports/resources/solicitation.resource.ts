import { Solicitation, Cart } from '@prisma/client'
import { QuotationService } from '../../settings/services/quotation.service'
import { DateHelper, CurrencyHelper } from '../../../common/helpers'

export class SolicitationResource {
  constructor(
    private readonly solicitation: Solicitation & {
      user?: { id: string; name: string; email: string; phone: string | null } | null
      client?: { id: string; name: string } | null
      cart?: Cart | null
    },
    private readonly quotationService?: QuotationService,
  ) {}

  async toArray(): Promise<Record<string, any>> {
    const cartItems = this.getCartItems()

    const data: Record<string, any> = {
      TIPO: this.getType(this.solicitation.type || ''),
      QUANTIDADE: this.solicitation.quantity || 0,
      STATUS: this.getStatus(this.solicitation.status),
      SOLICITANTE: this.solicitation.user?.name || 'N/A',
      EMAIL: this.solicitation.user?.email || 'N/A',
      TELEFONE: this.solicitation.user?.phone || 'N/A',
      CLIENTE: this.solicitation.client
        ? this.solicitation.client.name || ''
        : '',
      CNPJ: '',
      TOTAL: await this.getTotal(cartItems),
      DATA: DateHelper.formatBRWithTime(this.solicitation.createdAt),
    }

    return data
  }

  private getCartItems(): any[] | null {
    if (!this.solicitation.cart || !this.solicitation.cart.items) {
      return null
    }

    const items = this.solicitation.cart.items
    
    if (Array.isArray(items)) {
      return items
    }
    
    if (typeof items === 'string') {
      try {
        return JSON.parse(items)
      } catch {
        return null
      }
    }
    
    if (typeof items === 'object') {
      return Array.isArray(items) ? items : null
    }
    
    return null
  }

  private async getTotal(items: any[] | null): Promise<string> {
    if (!items || items.length === 0) {
      return 'R$ 0,00'
    }

    const getCNY = await this.getQuotationRate()
    const total = this.calculateTotal(items, getCNY)

    return CurrencyHelper.formatBRWithSymbol(total)
  }

  private async getQuotationRate(): Promise<number> {
    let quotation: any = null

    if (this.quotationService) {
      quotation = await this.fetchQuotation()
    }

    if (!quotation || !quotation.CNYBRL?.bid) {
      return 0.7
    }

    return parseFloat(quotation.CNYBRL.bid?.toString() || '0.7')
  }

  private async fetchQuotation(): Promise<any | null> {
    try {
      const quotationResponse = await this.quotationService!.getQuotation()
      return quotationResponse.data || null
    } catch (error) {
      console.warn('Falha ao obter cotação no SolicitationResource, usando valor padrão', {
        error: (error as Error).message,
      })
      return null
    }
  }

  private calculateTotal(items: any[], getCNY: number): number {
    const cart = this.solicitation.cart
    if (!cart || !cart.pricingData) {
      return this.calculateSimpleTotalForItems(items, getCNY)
    }

    const pricingData = this.parsePricingData(cart.pricingData)
    return this.calculateTotalFromPricingData(items, pricingData, getCNY)
  }

  private parsePricingData(pricingData: any): any {
    return typeof pricingData === 'string' ? JSON.parse(pricingData) : pricingData
  }

  private calculateTotalFromPricingData(items: any[], pricingData: any, getCNY: number): number {
    if (pricingData.custo_individual_por_item) {
      return this.calculateTotalFromIndividualItems(items, pricingData.custo_individual_por_item, getCNY)
    }

    if (pricingData.total_venda_produto?.total) {
      return this.calculateTotalFromProductTotal(pricingData.total_venda_produto.total)
    }

    return this.calculateSimpleTotalForItems(items, getCNY)
  }

  private calculateTotalFromIndividualItems(items: any[], custoIndividualPorItem: any, getCNY: number): number {
    let total = 0

    for (const item of items) {
      const itemId = item.id
      const custoItem = custoIndividualPorItem[itemId]

      if (custoItem) {
        total += this.calculateItemTotal(custoItem)
      } else {
        total += this.calculateSimpleTotal(item, getCNY)
      }
    }

    return total
  }

  private calculateItemTotal(custoItem: any): number {
    if (custoItem.variations) {
      return this.calculateTotalFromVariations(custoItem.variations)
    }

    return custoItem.preco_venda_item || 0
  }

  private calculateTotalFromVariations(variations: any[]): number {
    let total = 0

    for (const variation of variations) {
      if (variation.preco_total) {
        total += variation.preco_total
      }
    }

    return total
  }

  private calculateTotalFromProductTotal(totalArray: number[]): number {
    let total = 0
    for (const itemTotal of totalArray) {
      total += itemTotal
    }
    return total
  }

  private calculateSimpleTotal(item: any, getCNY: number): number {
    let total = 0
    if (item.variations && Array.isArray(item.variations)) {
      for (const variation of item.variations) {
        total += (variation.price * variation.quantity) * getCNY * 2.4
      }
    }
    return total
  }

  private calculateSimpleTotalForItems(items: any[], getCNY: number): number {
    let total = 0
    for (const item of items) {
      total += this.calculateSimpleTotal(item, getCNY)
    }
    return total
  }

  private getType(type: string): string {
    const types: Record<string, string> = {
      supplier_search: 'Busca por fornecedores',
      viability_study: 'Estudos de viabilidade',
    }
    return types[type] || 'Busca por fornecedores'
  }

  private getStatus(status: string): string {
    const statuses: Record<string, string> = {
      open: 'Novo',
      pending: 'Pendente',
      in_progress: 'Em andamento',
      finished: 'Finalizado',
    }
    return statuses[status] || 'Novo'
  }
}

