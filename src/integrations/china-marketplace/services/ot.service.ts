import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ProductNormalizerService } from '../../../modules/products/services/normalizers/product-normalizer.service'

@Injectable()
export class OtService {
  private readonly logger = new Logger(OtService.name)
  private readonly rapidApiKey: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly normalizer: ProductNormalizerService,
  ) {
    this.rapidApiKey = this.configService.get('RAPIDAPI_KEY') || ''
  }

  async searchProductsByKeywordAlibaba(params: {
    keyword: string
    page?: number
    pageSize?: number
    sort?: string
  }) {
    try {
      const endpoint = 'https://otapi-alibaba.p.rapidapi.com/BatchSearchItemsFrame'
      
      const queryParams = {
        language: 'en',
        framePosition: ((params.page || 1) - 1) * (params.pageSize || 20),
        frameSize: params.pageSize || 20,
        ItemTitle: params.keyword,
        OrderBy: this.mapSortToAlibaba(params.sort || 'default'),
      }

      this.logger.log('OtService::searchProductsByKeywordAlibaba - Parâmetros', queryParams)

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          headers: {
            'x-rapidapi-key': this.rapidApiKey,
            'x-rapidapi-host': 'otapi-alibaba.p.rapidapi.com',
          },
          timeout: 60000,
        }),
      )

      return this.normalizer.normalizeAlibabaSearchResponse(response.data)
    } catch (error) {
      this.logger.error('OtService::searchProductsByKeywordAlibaba - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: { items: [] }, msg: 'timeout', code: 408 }
      }
      
      return { data: { items: [] }, msg: 'unknown', code: 500 }
    }
  }

  async searchProductsByImageAlibaba(params: {
    imgUrl: string
    page?: number
    pageSize?: number
  }) {
    try {
      const endpoint = 'https://otapi-alibaba.p.rapidapi.com/SearchItemsByImage'
      
      const queryParams = {
        ImageUrl: params.imgUrl,
        framePosition: ((params.page || 1) - 1) * (params.pageSize || 20),
        frameSize: params.pageSize || 20,
      }

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          headers: {
            'x-rapidapi-key': this.rapidApiKey,
            'x-rapidapi-host': 'otapi-alibaba.p.rapidapi.com',
          },
          timeout: 60000,
        }),
      )

      return this.normalizer.normalizeAlibabaSearchResponse(response.data)
    } catch (error) {
      this.logger.error('OtService::searchProductsByImageAlibaba - Erro', error.message)
      
      return { data: { items: [] }, msg: 'error', code: 500 }
    }
  }

  async getProductDetailsAlibaba(productId: string) {
    try {
      const endpoint = 'https://otapi-alibaba.p.rapidapi.com/GetProductDetails'
      
      const queryParams = {
        ProductId: productId,
      }

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          headers: {
            'x-rapidapi-key': this.rapidApiKey,
            'x-rapidapi-host': 'otapi-alibaba.p.rapidapi.com',
          },
          timeout: 60000,
        }),
      )

      return this.normalizer.normalizeAlibabaDetailResponse(response.data)
    } catch (error) {
      this.logger.error('OtService::getProductDetailsAlibaba - Erro', error.message)
      
      return { data: null, msg: 'error', code: 500 }
    }
  }

  private mapSortToAlibaba(sort: string): string {
    const sortMap: { [key: string]: string } = {
      default: '',
      sales: 'TotalSales',
      price_up: 'PriceAsc',
      price_down: 'PriceDesc',
    }

    return sortMap[sort] || ''
  }
}


