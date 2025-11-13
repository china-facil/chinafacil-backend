import { Injectable } from '@nestjs/common'
import { Alibaba1688Normalizer } from './alibaba-1688.normalizer'
import { AlibabaIntlNormalizer } from './alibaba-intl.normalizer'
import { NormalizedProduct } from './product.interface'

@Injectable()
export class ProductNormalizerService {
  constructor(
    private readonly alibaba1688Normalizer: Alibaba1688Normalizer,
    private readonly alibabaIntlNormalizer: AlibabaIntlNormalizer,
  ) {}

  normalize1688SearchResponse(response: any): any {
    if (!response?.data?.items || !Array.isArray(response.data.items)) {
      return response
    }

    const normalizedItems = response.data.items.map((item: any) =>
      this.alibaba1688Normalizer.normalizeSearchItem(item),
    )

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
    if (!response?.Result?.Items || !Array.isArray(response.Result.Items)) {
      return {
        code: response.Code || 500,
        msg: response.Message || 'Error',
        data: { items: [] },
      }
    }

    const normalizedItems = response.Result.Items.map((item: any) =>
      this.alibabaIntlNormalizer.normalizeSearchItem(item),
    )

    return {
      code: 200,
      msg: 'success',
      data: {
        items: normalizedItems,
        total: response.Result.TotalCount || normalizedItems.length,
      },
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


