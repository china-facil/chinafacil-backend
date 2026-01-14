import { Injectable, Logger } from '@nestjs/common'
import * as puppeteer from 'puppeteer'
import { NcmService } from '../../tax-calculator/services/ncm.service'
import { CartPdfTemplateService } from './cart-pdf-template.service'

@Injectable()
export class CartPdfService {
  private readonly logger = new Logger(CartPdfService.name)

  constructor(
    private readonly ncmService: NcmService,
    private readonly templateService: CartPdfTemplateService,
  ) {}

  async generatePDF(data: any, detailed: boolean = false): Promise<Buffer> {
    await this.enrichProductsWithNcmData(data)

    const html = detailed
      ? this.templateService.generateDetailedHTML(data)
      : this.templateService.generateStandardHTML(data)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: detailed ? 'A4' : 'A4',
        landscape: !detailed,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        printBackground: true,
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }

  async enrichProductsWithNcmData(data: any): Promise<void> {
    if (!data.produtos || !Array.isArray(data.produtos)) {
      return
    }

    for (const produto of data.produtos) {
      const ncmCode = produto.ncm_code
      
      if (typeof ncmCode === 'string' && ncmCode.trim()) {
        try {
          const ncmData = await this.ncmService.findByCode(ncmCode)
          
          if (ncmData && 'codigo' in ncmData) {
            const parseAliquot = (value: any): number => {
              if (value === null || value === undefined) return 0
              const num = typeof value === 'string' ? parseFloat(value) : value
              return isNaN(num) ? 0 : num
            }
            
            produto.ncm_code = {
              codigo: ncmData.codigo || ncmCode,
              nome: ncmData.nome || null,
              ii: parseAliquot(ncmData.ii),
              ipi: parseAliquot(ncmData.ipi),
              pis: parseAliquot(ncmData.pis),
              cofins: parseAliquot(ncmData.cofins),
            }
          }
        } catch (error: any) {
          this.logger.warn(`Erro ao buscar NCM ${ncmCode} para produto ${produto.id}:`, error.message)
        }
      }
      else if (typeof ncmCode === 'object' && ncmCode) {
        const codigo = ncmCode.codigo || ncmCode.ncm || ncmCode.number
        
        if (codigo) {
          try {
            const ncmData = await this.ncmService.findByCode(codigo)
            
            if (ncmData && 'codigo' in ncmData) {
              const parseAliquot = (dbValue: any, existingValue: any): number => {
                if (dbValue !== undefined && dbValue !== null) {
                  const num = typeof dbValue === 'string' ? parseFloat(dbValue) : dbValue
                  return isNaN(num) ? 0 : num
                }
                if (existingValue !== undefined && existingValue !== null) {
                  const num = typeof existingValue === 'string' ? parseFloat(existingValue) : existingValue
                  return isNaN(num) ? 0 : num
                }
                return 0
              }
              
              produto.ncm_code = {
                ...ncmCode,
                codigo: ncmData.codigo || codigo,
                nome: ncmData.nome || ncmCode.nome,
                ii: parseAliquot(ncmData.ii, ncmCode.ii),
                ipi: parseAliquot(ncmData.ipi, ncmCode.ipi),
                pis: parseAliquot(ncmData.pis, ncmCode.pis),
                cofins: parseAliquot(ncmData.cofins, ncmCode.cofins),
              }
            }
          } catch (error: any) {
            this.logger.warn(`Erro ao buscar NCM ${codigo} para produto ${produto.id}:`, error.message)
          }
        }
      }
    }
  }
}
