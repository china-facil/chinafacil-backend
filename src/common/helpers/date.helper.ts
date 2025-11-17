export class DateHelper {
  static format(date: Date | string, format: string = 'DD/MM/YYYY'): string {
    if (!date) return ''
    
    const d = date instanceof Date ? date : new Date(date)
    
    if (isNaN(d.getTime())) return ''
    
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', String(year))
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  static formatBR(date: Date | string): string {
    return this.format(date, 'DD/MM/YYYY')
  }

  static formatBRWithTime(date: Date | string): string {
    return this.format(date, 'DD/MM/YYYY HH:mm')
  }

  static formatISO(date: Date | string): string {
    if (!date) return ''
    
    const d = date instanceof Date ? date : new Date(date)
    
    if (isNaN(d.getTime())) return ''
    
    return d.toISOString().split('T')[0]
  }

  static formatYMD(date: Date | string): string {
    return this.formatISO(date)
  }

  static addDays(date: Date | string, days: number): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  static addMonths(date: Date | string, months: number): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
  }

  static addYears(date: Date | string, years: number): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setFullYear(d.getFullYear() + years)
    return d
  }

  static isToday(date: Date | string): boolean {
    if (!date) return false
    
    const d = date instanceof Date ? date : new Date(date)
    const today = new Date()
    
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  }

  static isPast(date: Date | string): boolean {
    if (!date) return false
    
    const d = date instanceof Date ? date : new Date(date)
    return d < new Date()
  }

  static isFuture(date: Date | string): boolean {
    if (!date) return false
    
    const d = date instanceof Date ? date : new Date(date)
    return d > new Date()
  }

  static diffInDays(date1: Date | string, date2: Date | string): number {
    const d1 = date1 instanceof Date ? date1 : new Date(date1)
    const d2 = date2 instanceof Date ? date2 : new Date(date2)
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  static diffInHours(date1: Date | string, date2: Date | string): number {
    const d1 = date1 instanceof Date ? date1 : new Date(date1)
    const d2 = date2 instanceof Date ? date2 : new Date(date2)
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60))
  }

  static startOfDay(date: Date | string): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  static endOfDay(date: Date | string): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
  }

  static startOfMonth(date: Date | string): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }

  static endOfMonth(date: Date | string): Date {
    const d = date instanceof Date ? new Date(date) : new Date(date)
    d.setMonth(d.getMonth() + 1, 0)
    d.setHours(23, 59, 59, 999)
    return d
  }

  static isValid(date: Date | string): boolean {
    if (!date) return false
    
    const d = date instanceof Date ? date : new Date(date)
    return !isNaN(d.getTime())
  }

  static parseBR(dateString: string): Date | null {
    if (!dateString) return null
    
    const parts = dateString.split('/')
    if (parts.length !== 3) return null
    
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    
    const date = new Date(year, month, day)
    
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null
    }
    
    return date
  }

  static formatRelative(date: Date | string): string {
    if (!date) return ''
    
    const d = date instanceof Date ? date : new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return 'agora'
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
    
    return this.formatBR(d)
  }

  static getAge(birthDate: Date | string): number {
    if (!birthDate) return 0
    
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate)
    const today = new Date()
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
}


