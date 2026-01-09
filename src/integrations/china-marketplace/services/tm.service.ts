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

  async convertImageUrl(imageUrl: string): Promise<{ code: number; msg: string; data?: { image_url?: string } | null }> {
    this.logger.log('TmService::convertImageUrl - Iniciando conversão de imagem', {
      image_url: imageUrl,
      endpoint_url: this.baseUrl,
      has_api_key: !!this.apiKey,
    })

    const endpoint = `${this.baseUrl}/1688/tools/image/convert_url`
    const body = {
      apiToken: this.apiKey,
      url: imageUrl,
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(endpoint, body, {
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::convertImageUrl - Resposta recebida', {
        status_code: response.status,
        response_body: JSON.stringify(response.data).substring(0, 500),
        is_successful: response.status >= 200 && response.status < 300,
        has_data_key: !!response.data?.data,
        has_image_url_key: !!response.data?.data?.image_url,
      })

      return response.data
    } catch (error: any) {
      this.logger.error('TmService::convertImageUrl - Erro na requisição', {
        error_message: error.message,
        error_code: error.code,
        endpoint,
        body: { ...body, apiToken: '***' },
      })

      return {
        code: 500,
        msg: 'Erro na comunicação com o serviço: ' + error.message,
        data: null,
      }
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
      this.logger.log('TmService::searchProductsByImage - Iniciando busca', {
        originalImageUrl: params.imgUrl,
      })

      const convertResponse = await this.convertImageUrl(params.imgUrl)

      if (convertResponse.code !== 200 || !convertResponse.data?.image_url) {
        this.logger.warn('TmService::searchProductsByImage - Falha na conversão da imagem', {
          convertCode: convertResponse.code,
          convertMsg: convertResponse.msg,
        })
        return {
          code: convertResponse.code,
          msg: convertResponse.msg || 'Erro ao converter URL da imagem',
          data: { items: [], total_count: 0 },
        }
      }

      const convertedImageUrl = convertResponse.data.image_url

      this.logger.log('TmService::searchProductsByImage - Imagem convertida', {
        originalUrl: params.imgUrl,
        convertedUrl: convertedImageUrl,
      })

      const endpoint = `${this.baseUrl}/1688/search/image`
      const queryParams: any = {
        apiToken: this.apiKey,
        image_url: convertedImageUrl,
        img_url: convertedImageUrl,
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

      this.logger.log('TmService::searchProductsByImage - Buscando produtos', {
        endpoint,
        queryParams: { ...queryParams, apiToken: '***' },
      })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::searchProductsByImage - Resposta recebida', {
        statusCode: response.status,
        hasData: !!response.data,
        responseKeys: response.data ? Object.keys(response.data) : [],
        hasDataItems: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        itemsCount: response.data?.data?.items?.length || 0,
        responseSample: JSON.stringify(response.data).substring(0, 500),
      })

      const normalizedResponse = this.normalizer.normalize1688SearchResponse(response.data)
      
      this.logger.log('TmService::searchProductsByImage - Resposta normalizada', {
        code: normalizedResponse.code,
        msg: normalizedResponse.msg,
        itemsCount: normalizedResponse.data?.items?.length || 0,
      })

      return normalizedResponse
    } catch (error: any) {
      this.logger.error('TmService::searchProductsByImage - Erro', {
        message: error.message,
        code: error.code,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: { items: [], total_count: 0 }, msg: 'timeout', code: 408 }
      }
      
      return { data: { items: [], total_count: 0 }, msg: error.message || 'unknown', code: 500 }
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

  async searchProductsBySeller(params: {
    memberId: string
    page?: number
    pageSize?: number
    sort?: string
    priceStart?: number
    priceEnd?: number
  }) {
    try {
      const endpoint = `${this.baseUrl}/1688/shop/items`
      const queryParams: any = {
        apiToken: this.apiKey,
        member_id: params.memberId,
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sort: params.sort || 'sales',
      }

      if (params.priceEnd) {
        queryParams.price_end = params.priceEnd
      }

      if (params.priceStart) {
        queryParams.price_start = params.priceStart
      }

      this.logger.log('TmService::searchProductsBySeller - Iniciando busca por produtos do vendedor', {
        requestParams: queryParams,
      })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::searchProductsBySeller - Resposta recebida', {
        statusCode: response.status,
        isSuccessful: response.status >= 200 && response.status < 300,
        responseSize: JSON.stringify(response.data).length,
        endpoint,
      })

      const jsonResponse = response.data

      this.logger.log('TmService::searchProductsBySeller - JSON decodificado', {
        responseCode: jsonResponse['code'] ?? 'N/A',
        responseMsg: jsonResponse['msg'] ?? 'N/A',
        hasData: !!jsonResponse['data'],
        itemsCount: jsonResponse['data']?.items ? jsonResponse['data'].items.length : 0,
      })

      return jsonResponse
    } catch (error: any) {
      this.logger.error('TmService::searchProductsBySeller - Erro na requisição', {
        errorMessage: error.message,
        errorCode: error.code,
        endpoint: `${this.baseUrl}/1688/shop/items`,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: { items: [] }, msg: 'timeout', code: 408 }
      }
      
      return { data: { items: [] }, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }

  async getShopInfo(memberId: string) {
    try {
      const endpoint = `${this.baseUrl}/1688/shop/shop_info`
      const queryParams = {
        apiToken: this.apiKey,
        member_id: memberId,
      }

      this.logger.log('TmService::getShopInfo - Iniciando busca das informações da loja', {
        memberId,
        endpoint,
      })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::getShopInfo - Resposta recebida', {
        statusCode: response.status,
        isSuccessful: response.status >= 200 && response.status < 300,
        responseSize: JSON.stringify(response.data).length,
      })

      return response.data
    } catch (error: any) {
      this.logger.error('TmService::getShopInfo - Erro na requisição', {
        errorMessage: error.message,
        errorCode: error.code,
        memberId,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }

  async getShopCategories(memberId: string) {
    try {
      const endpoint = `${this.baseUrl}/1688/shop/category`
      const queryParams = {
        apiToken: this.apiKey,
        member_id: memberId,
      }

      this.logger.log('TmService::getShopCategories - Iniciando busca das categorias da loja', {
        memberId,
        endpoint,
      })

      const response = await firstValueFrom(
        this.httpService.get(endpoint, {
          params: queryParams,
          timeout: 60000,
        }),
      )

      this.logger.log('TmService::getShopCategories - Resposta recebida', {
        statusCode: response.status,
        isSuccessful: response.status >= 200 && response.status < 300,
        responseSize: JSON.stringify(response.data).length,
      })

      return response.data
    } catch (error: any) {
      this.logger.error('TmService::getShopCategories - Erro na requisição', {
        errorMessage: error.message,
        errorCode: error.code,
        memberId,
      })
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { data: null, msg: 'timeout', code: 408 }
      }
      
      return { data: null, msg: 'Erro na comunicação com o serviço: ' + error.message, code: 500 }
    }
  }
}
