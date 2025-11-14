export class StringHelper {
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
  }

  static truncate(text: string, length: number, suffix = '...'): string {
    if (!text || text.length <= length) {
      return text || ''
    }
    return text.substring(0, length - suffix.length) + suffix
  }

  static capitalize(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  static camelToSnake(text: string): string {
    return text.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  static snakeToCamel(text: string): string {
    return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  static sanitize(text: string): string {
    if (!text) return ''
    return text
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }

  static removeAccents(text: string): string {
    if (!text) return ''
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  static sanitizePhone(phone: string): string {
    if (!phone) return ''
    return phone.replace(/\D/g, '')
  }

  static formatPhone(phone: string, format: 'BR' | 'INTERNATIONAL' = 'BR'): string {
    const cleaned = this.sanitizePhone(phone)
    
    if (format === 'BR') {
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      }
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      }
    }
    
    return cleaned
  }

  static sanitizeEmail(email: string): string {
    if (!email) return ''
    return email.trim().toLowerCase()
  }

  static isValidEmail(email: string): boolean {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static sanitizeCNPJ(cnpj: string): string {
    if (!cnpj) return ''
    return cnpj.replace(/\D/g, '')
  }

  static formatCNPJ(cnpj: string): string {
    const cleaned = this.sanitizeCNPJ(cnpj)
    if (cleaned.length === 14) {
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return cleaned
  }

  static sanitizeCEP(cep: string): string {
    if (!cep) return ''
    return cep.replace(/\D/g, '')
  }

  static formatCEP(cep: string): string {
    const cleaned = this.sanitizeCEP(cep)
    if (cleaned.length === 8) {
      return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2')
    }
    return cleaned
  }

  static removeHtmlTags(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  }

  static escapeHtml(text: string): string {
    if (!text) return ''
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  static generateRandomString(length: number, characters?: string): string {
    const chars = characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static mask(text: string, pattern: string): string {
    if (!text) return ''
    let masked = ''
    let textIndex = 0
    
    for (let i = 0; i < pattern.length && textIndex < text.length; i++) {
      if (pattern[i] === '#') {
        masked += text[textIndex]
        textIndex++
      } else {
        masked += pattern[i]
      }
    }
    
    return masked
  }

  static normalizeWhitespace(text: string): string {
    if (!text) return ''
    return text.replace(/\s+/g, ' ').trim()
  }

  static extractNumbers(text: string): string {
    if (!text) return ''
    return text.replace(/\D/g, '')
  }
}

