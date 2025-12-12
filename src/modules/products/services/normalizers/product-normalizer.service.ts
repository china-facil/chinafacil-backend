import { Injectable, Logger } from '@nestjs/common'
import { Alibaba1688Normalizer } from './alibaba-1688.normalizer'
import { AlibabaIntlNormalizer } from './alibaba-intl.normalizer'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class ProductNormalizerService {
  private readonly logger = new Logger(ProductNormalizerService.name)

  constructor(
    private readonly alibaba1688Normalizer: Alibaba1688Normalizer,
    private readonly alibabaIntlNormalizer: AlibabaIntlNormalizer,
  ) {}

  normalize1688SearchResponse(response: any): any {
    this.logger.log('ProductNormalizerService::normalize1688SearchResponse - Iniciando', {
      hasResponse: !!response,
      responseKeys: response ? Object.keys(response) : [],
      hasData: !!response?.data,
      dataKeys: response?.data ? Object.keys(response.data) : [],
      hasItems: !!response?.data?.items,
      itemsIsArray: Array.isArray(response?.data?.items),
      itemsCount: Array.isArray(response?.data?.items) ? response.data.items.length : 0,
    })

    if (!response?.data?.items || !Array.isArray(response.data.items)) {
      this.logger.warn('ProductNormalizerService::normalize1688SearchResponse - Resposta inválida ou sem items', {
        hasData: !!response?.data,
        hasItems: !!response?.data?.items,
        itemsType: typeof response?.data?.items,
        responseSample: JSON.stringify(response).substring(0, 500),
      })
      return response
    }

    const normalizedItems = response.data.items.map((item: any) => {
      try {
        return this.alibaba1688Normalizer.normalizeSearchItem(item)
      } catch (error: any) {
        this.logger.warn('ProductNormalizerService::normalize1688SearchResponse - Erro ao normalizar item', {
          error: error.message,
          itemSample: JSON.stringify(item).substring(0, 200),
        })
        return null
      }
    }).filter((item: any) => item !== null)

    this.logger.log('ProductNormalizerService::normalize1688SearchResponse - Sucesso', {
      normalizedItemsCount: normalizedItems.length,
      total: response.data.total_count || normalizedItems.length,
    })

    return {
      ...response,
      data: {
        ...response.data,
        items: normalizedItems,
      },
    }
  }

  normalize1688DetailResponse(response: any): any {
    if (!response?.data) {
      return response
    }

    const normalizedProduct = this.alibaba1688Normalizer.normalizeDetailedItem(
      response.data,
    )

    return {
      ...response,
      data: normalizedProduct,
    }
  }

  normalizeAlibabaSearchResponse(response: any): any {
    try {
      const itemsArray = response?.Result?.Items?.Items?.Content || response?.Result?.Items

      this.logger.log('ProductNormalizerService::normalizeAlibabaSearchResponse - Iniciando', {
        hasResponse: !!response,
        errorCode: response?.ErrorCode,
        hasResult: !!response?.Result,
        hasItems: !!response?.Result?.Items,
        hasItemsItems: !!response?.Result?.Items?.Items,
        hasContent: !!response?.Result?.Items?.Items?.Content,
        itemsIsArray: Array.isArray(itemsArray),
        itemsCount: Array.isArray(itemsArray) ? itemsArray.length : 0,
      })

      if (!itemsArray || !Array.isArray(itemsArray)) {
        this.logger.warn('ProductNormalizerService::normalizeAlibabaSearchResponse - Resposta inválida', {
          errorCode: response?.ErrorCode,
          hasResult: !!response?.Result,
          hasItems: !!response?.Result?.Items,
          hasItemsItems: !!response?.Result?.Items?.Items,
          hasContent: !!response?.Result?.Items?.Items?.Content,
          responseSample: JSON.stringify(response).substring(0, 500),
        })
        
        return {
          code: response?.ErrorCode === 'Ok' ? 200 : 500,
          msg: response?.ErrorCode === 'Ok' ? 'Nenhum item encontrado' : 'Error',
          data: { items: [] },
        }
      }

      const normalizedItems = itemsArray.map((item: any) => {
        try {
          return this.alibabaIntlNormalizer.normalizeSearchItem(item)
        } catch (error: any) {
          this.logger.warn('ProductNormalizerService::normalizeAlibabaSearchResponse - Erro ao normalizar item', {
            error: error.message,
            itemSample: JSON.stringify(item).substring(0, 200),
          })
          return null
        }
      }).filter((item: any) => item !== null)

      this.logger.log('ProductNormalizerService::normalizeAlibabaSearchResponse - Sucesso', {
        normalizedItemsCount: normalizedItems.length,
        total: response.Result?.Items?.Items?.TotalCount || normalizedItems.length,
      })

      return {
        code: 200,
        msg: 'success',
        data: {
          items: normalizedItems,
          total: response.Result?.Items?.Items?.TotalCount || normalizedItems.length,
        },
      }
    } catch (error: any) {
      this.logger.error('ProductNormalizerService::normalizeAlibabaSearchResponse - Erro crítico', {
        error: error.message,
        stack: error.stack,
        responseSample: JSON.stringify(response).substring(0, 500),
      })
      
      return {
        code: response?.ErrorCode === 'Ok' ? 200 : 500,
        msg: response?.ErrorCode === 'Ok' ? 'Erro ao processar resposta' : 'Error',
        data: { items: [] },
      }
    }
  }

  normalizeAlibabaDetailResponse(response: any): any {
    if (!response?.Result?.Item) {
      return response
    }

    const vendorData = response.Result?.Vendor || null
    const normalizedProduct = this.alibabaIntlNormalizer.normalizeDetailedItem(
      response.Result.Item,
      vendorData,
    )

    return {
      code: 200,
      msg: 'success',
      data: normalizedProduct,
    }
  }

  normalizeAuto(item: any): NormalizedProduct {
    if (item.provider) {
      return item as NormalizedProduct
    }

    if (item.Id || item.QuantityRanges || item.VendorId) {
      return this.alibabaIntlNormalizer.normalizeSearchItem(item)
    }

    return this.alibaba1688Normalizer.normalizeSearchItem(item)
  }

  normalizeMixedItems(items: any[]): NormalizedProduct[] {
    return items.map(item => this.normalizeAuto(item))
  }
}


