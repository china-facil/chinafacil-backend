import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ProductNormalizerService } from '../../../modules/products/services/normalizers/product-normalizer.service'

@Injectable()
export class TmService {
  private readonly logger = new Logger(TmService.name)
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly normalizer: ProductNormalizerService,
  ) {
    this.baseUrl = this.configService.get('TM_SERVICE_API_URL') || ''
    this.apiKey = this.configService.get('TM_SERVICE_API_KEY') || ''
    
    if (!this.baseUrl) {
      this.logger.warn('TM_SERVICE_API_URL não configurado. Endpoints do TmService podem falhar.')
    }
  }

  async searchProductsByKeyword(params: {
    keyword: string
    page?: number
    pageSize?: number
    sort?: string
    priceStart?: number
    priceEnd?: number
  }) {
    try {
      const endpoint = `${this.baseUrl}/1688/search/items`
      const queryParams: any = {
        apiToken: this.apiKey,
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sort: params.sort || 'default',
        keyword: params.keyword,
      }

      if (params.priceEnd) {
        queryParams.price_end = params.priceEnd
      }

      if (params.priceStart) {
        queryParams.price_start = params.priceStart
      }

      this.logger.log('TmService::searchProductsByKeyword - Parâmetros', queryParams)

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return this.normalizer.normalize1688SearchResponse(response.data)
    } catch (error) {
      this.logger.error('TmService::searchProductsByKeyword - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: [], msg: 'timeout', code: 408 }
      }
      
      return { data: [], msg: 'unknown', code: 500 }
    }
  }

  async searchProductsByImage(params: {
    imgUrl: string
    page?: number
    pageSize?: number
    sort?: string
    priceStart?: number
    priceEnd?: number
  }) {
    try {
      const endpoint = `${this.baseUrl}/1688/search/image`
      const queryParams: any = {
        apiToken: this.apiKey,
        img_url: params.imgUrl,
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sort: params.sort || 'default',
      }

      if (params.priceEnd) {
        queryParams.price_end = params.priceEnd
      }

      if (params.priceStart) {
        queryParams.price_start = params.priceStart
      }

      this.logger.log('TmService::searchProductsByImage - Iniciando busca')

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::searchProductsByImage - Resposta recebida')

      return this.normalizer.normalize1688SearchResponse(response.data)
    } catch (error) {
      this.logger.error('TmService::searchProductsByImage - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: [], msg: 'timeout', code: 408 }
      }
      
      return { data: [], msg: 'unknown', code: 500 }
    }
  }

  async getProductDetails(itemId: string) {
    try {
      if (!this.baseUrl) {
        this.logger.error('TmService::getProductDetails - TM_SERVICE_API_URL não configurado')
        return { data: null, msg: 'TM_SERVICE_API_URL não configurado', code: 500 }
      }

      const endpoint = `${this.baseUrl}/1688/v2/item_detail`
      const queryParams = {
        apiToken: this.apiKey,
        item_id: itemId,
      }

      this.logger.log('TmService::getProductDetails - Buscando detalhes', { 
        itemId,
        endpoint,
        baseUrl: this.baseUrl,
      })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return this.normalizer.normalize1688DetailResponse(response.data)
    } catch (error: any) {
      this.logger.error('TmService::getProductDetails - Erro', {
        message: error.message,
        code: error.code,
        baseUrl: this.baseUrl,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'unknown', code: 500 }
    }
  }

  async getProductSkuDetails(itemId: string) {
    try {
      if (!this.baseUrl) {
        this.logger.error('TmService::getProductSkuDetails - TM_SERVICE_API_URL não configurado')
        return { data: null, msg: 'TM_SERVICE_API_URL não configurado', code: 500 }
      }

      const endpoint = `${this.baseUrl}/1688/item/sku`
      const queryParams = {
        apiToken: this.apiKey,
        item_id: itemId,
      }

      this.logger.log('TmService::getProductSkuDetails - Buscando SKUs', { itemId, endpoint })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return response.data
    } catch (error: any) {
      this.logger.error('TmService::getProductSkuDetails - Erro', {
        message: error.message,
        code: error.code,
        baseUrl: this.baseUrl,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'unknown', code: 500 }
    }
  }

  async getProductShipping(params: {
    itemId: string
    quantity: number
    province?: string
    city?: string
  }) {
    try {
      const endpoint = `${this.baseUrl}/1688/item/shipping`
      const queryParams = {
        apiToken: this.apiKey,
        item_id: params.itemId,
        quantity: params.quantity,
        province: params.province || 'Guangdong',
        city: params.city || 'Shenzhen',
      }

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return response.data
    } catch (error) {
      this.logger.error('TmService::getProductShipping - Erro', error.message)
      return { data: null, msg: 'error', code: 500 }
    }
  }

  async getProductStatistics(itemId: string) {
    try {
      const endpoint = `${this.baseUrl}/1688/item/statistics/sales`
      const queryParams = {
        apiToken: this.apiKey,
        item_id: itemId,
      }

      this.logger.log('TmService::getProductStatistics - Buscando estatísticas', { itemId })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return response.data
    } catch (error) {
      this.logger.error('TmService::getProductStatistics - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }

  async getProductDescription(itemId: string) {
    try {
      const endpoint = `${this.baseUrl}/1688/item_desc`
      const queryParams = {
        apiToken: this.apiKey,
        item_id: itemId,
      }

      this.logger.log('TmService::getProductDescription - Buscando descrição', { itemId })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::getProductDescription - Resposta recebida', {
        statusCode: response.status,
        hasData: !!response.data,
      })

      return response.data
    } catch (error) {
      this.logger.error('TmService::getProductDescription - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }

  async getCategoryInfo(categoryId: string) {
    try {
      const endpoint = `${this.baseUrl}/1688/category/info`
      const queryParams = {
        apiToken: this.apiKey,
        cat_id: categoryId,
      }

      this.logger.log('TmService::getCategoryInfo - Buscando informações da categoria', { categoryId })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      return response.data
    } catch (error) {
      this.logger.error('TmService::getCategoryInfo - Erro', error.message)
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }
}


