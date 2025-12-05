import { User } from '@prisma/client'

export class UserResource {
  constructor(private readonly user: User & { type?: string }) {}

  toArray(): Record<string, any> {
    const data: Record<string, any> = {
      TIPO: this.getRole(this.user.role),
      NOME: this.user.name,
      EMAIL: this.user.email,
      TELEFONE: this.user.phone || '',
      'CADASTRADO EM': this.formatDate(this.user.createdAt),
    }

    if (this.user.role === 'lead') {
      data.CNPJ = this.user.cnpj || ''
      data['NUMERO FUNCIONARIOS'] = this.user.employees || ''
      data['FATURAMENTO MENSAL'] = this.user.monthlyBilling || ''

      if (this.user.type !== 'pdf') {
        data['NOME EMPRESA'] = null
        data.STATUS = null
        data['DATA ABERTURA'] = null
        data['RAZÃO SOCIAL'] = null
        data.PORTE = null
        data['NATUREZA JURÍDICA'] = null
        data['CAPITAL SOCIAL'] = null
        data['ATUALIZADO EM'] = null
        data.EMAIL_CNPJ = null
        data.TELEFONE_CNPJ = null
        data.ENDEREÇO = null
        data.COMPLEMENTO = null
        data.BAIRRO = null
        data.CIDADE = null
        data.ESTADO = null
        data.CEP = null
        data.PAÍS = null
        data['ATIVIDADE PRINCIPAL'] = null
        data['ATIVIDADES SECUNDÁRIAS'] = null
        data.SÓCIOS = null

        if (this.user.companyData) {
          const companyData = this.user.companyData as any
          const company = companyData.company || {}
          const status = companyData.status || {}
          const address = companyData.address || {}
          const mainActivity = companyData.mainActivity || {}
          const sideActivities = companyData.sideActivities || []
          const members = company.company?.members || []

          data['NOME EMPRESA'] = company.name || ''
          data.STATUS = status.text || ''
          data['DATA ABERTURA'] = companyData.founded
            ? this.formatDate(new Date(companyData.founded))
            : ''
          data['RAZÃO SOCIAL'] = company.name || ''
          data.PORTE = company.size?.text || ''
          data['NATUREZA JURÍDICA'] = company.nature?.text || ''
          data['CAPITAL SOCIAL'] = company.equity
            ? `R$ ${this.formatCurrency(company.equity)}`
            : ''
          data['ATUALIZADO EM'] = companyData.updated
            ? this.formatDate(new Date(companyData.updated))
            : ''

          if (companyData.emails && Array.isArray(companyData.emails)) {
            data.EMAIL_CNPJ = companyData.emails
              .map((email: any) => email.address)
              .join(', ')
          }

          if (companyData.phones && Array.isArray(companyData.phones)) {
            data.TELEFONE_CNPJ = companyData.phones
              .map((phone: any) => {
                const number = phone.number
                let formattedNumber = number

                if (number.length === 8) {
                  formattedNumber = number.replace(/(\d{4})(\d{4})/, '$1-$2')
                } else if (number.length === 9) {
                  formattedNumber = number.replace(/(\d{5})(\d{4})/, '$1-$2')
                }

                return `(${phone.area}) ${formattedNumber}`
              })
              .join(', ')
          }

          data.ENDEREÇO = `${address.street || ''}, ${address.number || ''}`
          data.COMPLEMENTO = address.details || ''
          data.BAIRRO = address.district || ''
          data.CIDADE = address.city || ''
          data.ESTADO = address.state || ''
          data.CEP = address.zip
            ? address.zip.replace(/(\d{5})(\d{3})/, '$1-$2')
            : ''
          data.PAÍS = address.country?.name || ''

          data['ATIVIDADE PRINCIPAL'] = mainActivity.text || ''

          data['ATIVIDADES SECUNDÁRIAS'] = sideActivities
            .map((activity: any) => activity.text)
            .join(', ')

          data.SÓCIOS = members
            .map(
              (member: any) =>
                `${member.person?.name || ''} (${member.role?.text || ''})`,
            )
            .join(', ')
        }
      }
    }

    return data
  }

  private getRole(role: string): string {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      client: 'Cliente',
      lead: 'Lead',
      user: 'Usuário',
      seller: 'Vendedor',
      sourcer: 'Sourcer',
    }
    return roles[role] || 'Lead'
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

