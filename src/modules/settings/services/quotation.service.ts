import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getQuotation() {
    const cachedBid = await this.cacheManager.get('quotation')
    if (cachedBid) {
      return {
        cached: true,
        status: 'success',
        data: cachedBid,
      }
    }

    try {
      const awesomeApiUrl = this.configService.get<string>('AWESOME_API_URL')
      const awesomeApiToken = this.configService.get<string>('AWESOME_API_TOKEN')

      if (!awesomeApiUrl || !awesomeApiToken) {
        this.logger.warn('Variáveis de ambiente AWESOME_API_URL ou AWESOME_API_TOKEN não configuradas')
        return this.getDefaultQuotation()
      }

      const endpoint = `${awesomeApiUrl}/last/CNY-BRL,USD-BRLPTAX?token=${awesomeApiToken}`
      
      const response = await firstValueFrom(
        this.httpService.get(endpoint, { timeout: 10000 })
      )

      if (response.status === 200 && response.data) {
        const data = response.data

        if (data['CNYBRL'] && data['CNYBRL']['bid']) {
          await this.cacheManager.set('quotation', data, 86400000)
          return {
            status: 'success',
            data: data,
          }
        } else {
          this.logger.warn('API de cotação retornou formato inválido', { data })
        }
      } else {
        this.logger.warn('API de cotação retornou erro', {
          status: response.status,
          data: response.data,
        })
      }
    } catch (error) {
      this.logger.error('Erro ao buscar cotação', {
        error: error.message,
        stack: error.stack,
      })
    }

    return this.getDefaultQuotation()
  }

  private async getDefaultQuotation() {
    const defaultData = {
      CNYBRL: { bid: 0.7 },
      USDBRLPTAX: { bid: 5.2 },
    }

    await this.cacheManager.set('quotation', defaultData, 1800000)

    return {
      status: 'success',
      data: defaultData,
      fallback: true,
    }
  }
}

