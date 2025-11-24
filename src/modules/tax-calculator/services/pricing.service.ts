import { Injectable, Logger } from '@nestjs/common'
import { QuotationService } from '../../settings/services/quotation.service'
import { FreightsService } from '../../settings/services/freights.service'

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name)

  constructor(
    private readonly quotationService: QuotationService,
    private readonly freightsService: FreightsService,
  ) {}

  async calculateImportTax(
    productValue: number,
    freightValue: number,
    insuranceValue: number,
    ncmCode?: string,
  ) {
    const cif = productValue + freightValue + insuranceValue

    const importTaxes = {
      iof: this.calculateIOF(cif),
      pis: this.calculatePIS(cif),
      cofins: this.calculateCOFINS(cif),
      icms: this.calculateICMS(cif),
      ipi: this.calculateIPI(cif, ncmCode),
    }

    const total =
      importTaxes.iof +
      importTaxes.pis +
      importTaxes.cofins +
      importTaxes.icms +
      importTaxes.ipi

    return {
      ...importTaxes,
      total: this.round2(total),
    }
  }

  async calculateShipping(
    volume: number,
    weight: number,
    origin?: string,
    destination?: string,
  ) {
    try {
      const freight = await this.freightsService.calculateFreight({
        volume,
        weight,
        origin: origin || 'Guangzhou',
        destination: destination || 'São Paulo',
      })

      return {
        international: freight.total,
        national: 0,
        total: freight.total,
      }
    } catch (error: any) {
      this.logger.error(`Erro ao calcular frete: ${error.message}`)
      return {
        international: 0,
        national: 0,
        total: 0,
      }
    }
  }

  async calculateTotalCost(
    productValue: number,
    freightValue: number,
    insuranceValue: number,
    importTaxes: number,
    brazilExpenses: number,
    nationalFreight: number = 0,
  ) {
    const cif = productValue + freightValue + insuranceValue
    const importedCost = cif + importTaxes + brazilExpenses
    const totalCost = importedCost + nationalFreight

    return {
      cif: this.round2(cif),
      importedCost: this.round2(importedCost),
      totalCost: this.round2(totalCost),
      breakdown: {
        productValue: this.round2(productValue),
        freightValue: this.round2(freightValue),
        insuranceValue: this.round2(insuranceValue),
        importTaxes: this.round2(importTaxes),
        brazilExpenses: this.round2(brazilExpenses),
        nationalFreight: this.round2(nationalFreight),
      },
    }
  }

  private calculateIOF(cif: number): number {
    return this.round2(cif * 0.0063)
  }

  private calculatePIS(cif: number): number {
    const base = cif * 1.0063
    return this.round2(base * 0.0165)
  }

  private calculateCOFINS(cif: number): number {
    const base = cif * 1.0063
    return this.round2(base * 0.076)
  }

  private calculateICMS(cif: number): number {
    const base = cif * 1.0063
    const pisCofins = this.calculatePIS(cif) + this.calculateCOFINS(cif)
    const baseICMS = base + pisCofins
    return this.round2((baseICMS * 0.18) / 0.82)
  }

  private calculateIPI(cif: number, ncmCode?: string): number {
    const ipiRate = this.getIPIRate(ncmCode)
    const base = cif * 1.0063
    return this.round2(base * ipiRate)
  }

  private getIPIRate(ncmCode?: string): number {
    if (!ncmCode) return 0.15

    const codePrefix = ncmCode.substring(0, 2)
    const ipiRates: Record<string, number> = {
      '84': 0.15,
      '85': 0.15,
      '90': 0.15,
      '94': 0.15,
    }

    return ipiRates[codePrefix] || 0.15
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100
  }
}




