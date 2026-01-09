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

      this.logger.log('OtService::searchProductsByKeywordAlibaba - Resposta recebida', {
        statusCode: response.status,
        hasData: !!response.data,
        responseCode: response.data?.Code,
        responseMessage: response.data?.Message,
        responseDataKeys: response.data ? Object.keys(response.data) : [],
        responseDataSample: JSON.stringify(response.data).substring(0, 500),
      })

      if (!response.data) {
        this.logger.error('OtService::searchProductsByKeywordAlibaba - Resposta sem dados')
        return { data: { items: [] }, msg: 'Resposta da API sem dados', code: 500 }
      }

      const normalizedResponse = this.normalizer.normalizeAlibabaSearchResponse(response.data)
      
      this.logger.log('OtService::searchProductsByKeywordAlibaba - Resposta normalizada', {
        code: normalizedResponse.code,
        msg: normalizedResponse.msg,
        itemsCount: normalizedResponse.data?.items?.length || 0,
      })

      return normalizedResponse
    } catch (error: any) {
      this.logger.error('OtService::searchProductsByKeywordAlibaba - Erro', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { 
          data: { items: [] }, 
          msg: 'RAPIDAPI_KEY inválido ou sem permissão', 
          code: 401 
        }
      }
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: { items: [] }, msg: 'timeout', code: 408 }
      }
      
      if (error.response?.data) {
        return this.normalizer.normalizeAlibabaSearchResponse(error.response.data)
      }
      
      return { data: { items: [] }, msg: error.message || 'Erro desconhecido', code: 500 }
    }
  }

  async searchProductsByImageAlibaba(params: {
    imgUrl: string
    page?: number
    pageSize?: number
  }) {
    try {
      const endpoint = 'https://otapi-alibaba.p.rapidapi.com/BatchSearchItemsFrame'
      
      const queryParams = {
        ImageUrl: params.imgUrl,
        framePosition: ((params.page || 1) - 1) * (params.pageSize || 20),
        frameSize: params.pageSize || 20,
      }

      this.logger.log('OtService::searchProductsByImageAlibaba - Parâmetros', queryParams)

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

      this.logger.log('OtService::searchProductsByImageAlibaba - Resposta recebida', {
        statusCode: response.status,
        hasData: !!response.data,
        responseCode: response.data?.Code,
        responseMessage: response.data?.Message,
      })

      if (!response.data) {
        this.logger.error('OtService::searchProductsByImageAlibaba - Resposta sem dados')
        return { data: { items: [] }, msg: 'Resposta da API sem dados', code: 500 }
      }

      const normalizedResponse = this.normalizer.normalizeAlibabaSearchResponse(response.data)
      
      this.logger.log('OtService::searchProductsByImageAlibaba - Resposta normalizada', {
        code: normalizedResponse.code,
        msg: normalizedResponse.msg,
        itemsCount: normalizedResponse.data?.items?.length || 0,
      })

      return normalizedResponse
    } catch (error: any) {
      this.logger.error('OtService::searchProductsByImageAlibaba - Erro', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      
      if (error.response?.status === 404) {
        return { 
          data: { items: [] }, 
          msg: 'Endpoint de busca por imagem não disponível na API', 
          code: 404 
        }
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { 
          data: { items: [] }, 
          msg: 'RAPIDAPI_KEY inválido ou sem permissão', 
          code: 401 
        }
      }
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: { items: [] }, msg: 'timeout', code: 408 }
      }
      
      if (error.response?.data) {
        return this.normalizer.normalizeAlibabaSearchResponse(error.response.data)
      }
      
      return { data: { items: [] }, msg: error.message || 'Erro desconhecido', code: 500 }
    }
  }

  async getProductDetailsAlibaba(productId: string) {
    try {
      const endpoint = 'https://otapi-alibaba.p.rapidapi.com/BatchGetItemFullInfo'
      
      const queryParams = {
        itemId: productId,
        language: 'en',
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
    } catch (error: any) {
      this.logger.error('OtService::getProductDetailsAlibaba - Erro', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      })
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { 
          data: null, 
          msg: 'RAPIDAPI_KEY inválido ou sem permissão', 
          code: 401 
        }
      }
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: error.message || "Erro desconhecido", code: 500 };
    }
  }

  private mapSortToAlibaba(sort: string): string {
    const sortMap: { [key: string]: string } = {
      default: '',
      sales: 'TotalSales:Desc',
      price_up: 'Price:Asc',
      price_down: 'Price:Desc',
    }

    return sortMap[sort] || ''
  }
}


