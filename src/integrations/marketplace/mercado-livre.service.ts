import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name)
  private readonly baseUrl: string
  private accessToken: string | null = null

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get('ML_SERVICE_API_URL') ||
      'https://api.mercadolibre.com'
  }

  private async auth(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    try {
      const clientId =
        this.configService.get('ML_SERVICE_CLIENT_ID') ||
        '7798046014205294'
      const clientSecret =
        this.configService.get('ML_SERVICE_CLIENT_SECRET') ||
        'ormdUsppSN7lekV5DlXGn5tzfFnqSuOf'

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      )

      this.accessToken = response.data.access_token
      if (!this.accessToken) {
        throw new Error('Access token não retornado pela API')
      }
      return this.accessToken
    } catch (error: any) {
      this.logger.error(`Erro ao autenticar no Mercado Livre: ${error.message}`)
      throw error
    }
  }

  async categoriesList() {
    try {
      const token = await this.auth()

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/sites/MLB/categories`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      )

      return response.data
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar categorias do Mercado Livre: ${error.message}`,
      )
      throw error
    }
  }

  async getProductsByCategory(
    category: string,
    options?: { sort?: string; offset?: number; limit?: number },
  ) {
    try {
      const token = await this.auth()

      const query = {
        category,
        sort: options?.sort || 'sold_quantity',
        offset: options?.offset || 0,
        limit: options?.limit || 25,
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/sites/MLB/search`, {
          params: query,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      )

      return response.data
    } catch (error: any) {
      this.logger.error(
        `Erro ao buscar produtos por categoria: ${error.message}`,
      )
      throw error
    }
  }
}

