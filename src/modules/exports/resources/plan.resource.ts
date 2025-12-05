import { Client } from '@prisma/client'

export class PlanResource {
  constructor(private readonly plan: Client) {}

  toArray(): Record<string, any> {
    const data: Record<string, any> = {
      NOME: this.plan.name,
      PREÇO: `R$ ${this.formatCurrency(Number(this.plan.price))}`,
      'BUSCAS POR FORNECEDORES': this.plan.supplierSearch || 0,
      'ESTUDOS DE VIABILIDADE': this.plan.viabilityStudy || 0,
      STATUS: this.plan.deletedAt ? 'Desativado' : 'Ativo',
      'CADASTRADO EM': this.plan.createdAt
        ? this.formatDate(this.plan.createdAt)
        : '',
    }

    return data
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

