import { Solicitation, Cart } from '@prisma/client'
import { QuotationService } from '../../settings/services/quotation.service'

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
      DATA: this.formatDate(this.solicitation.createdAt),
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

    let quotation: any = null

    if (this.quotationService) {
      try {
        const quotationResponse = await this.quotationService.getQuotation()
        quotation = quotationResponse.data || null
      } catch (error) {
        console.warn('Falha ao obter cotação no SolicitationResource, usando valor padrão', {
          error: (error as Error).message,
        })
      }
    }

    if (!quotation || !quotation.CNYBRL?.bid) {
      quotation = { CNYBRL: { bid: 0.7 } }
    }

    const getCNY = parseFloat(quotation.CNYBRL.bid?.toString() || '0.7')
    let total = 0

    const cart = this.solicitation.cart
    if (cart && cart.pricingData) {
      const pricingData =
        typeof cart.pricingData === 'string'
          ? JSON.parse(cart.pricingData)
          : cart.pricingData

      if (pricingData.custo_individual_por_item) {
        const custoIndividualPorItem = pricingData.custo_individual_por_item

        for (const item of items) {
          const itemId = item.id

          if (custoIndividualPorItem[itemId]) {
            const custoItem = custoIndividualPorItem[itemId]

            if (custoItem.variations) {
              for (const variation of custoItem.variations) {
                if (variation.preco_total) {
                  total += variation.preco_total
                }
              }
            } else {
              total += custoItem.preco_venda_item || 0
            }
          } else {
            total += this.calculateSimpleTotal(item, getCNY)
          }
        }
      } else if (pricingData.total_venda_produto?.total) {
        for (const itemTotal of pricingData.total_venda_produto.total) {
          total += itemTotal
        }
      } else {
        total = this.calculateSimpleTotalForItems(items, getCNY)
      }
    } else {
      total = this.calculateSimpleTotalForItems(items, getCNY)
    }

    return `R$ ${this.formatCurrency(total)}`
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

  private formatDate(date: Date): string {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  private formatCurrency(value: number): string {
    return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
}

