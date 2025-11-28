import { Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { QuotationService } from '../../settings/services/quotation.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class ProductCatalogService {
  private readonly logger = new Logger(ProductCatalogService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationService: QuotationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPopularProducts(options: {
    orderBy?: string
    priceMin?: number
    priceMax?: number
    page?: number
  }) {
    const { orderBy, priceMin, priceMax, page = 1 } = options

    const cacheKey = `popular_products:${orderBy || 'default'}:${priceMin || ''}:${priceMax || ''}:${page}`

    const cached = await this.cacheManager.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const quotationData = await this.quotationService.getQuotation()
      const quotation = quotationData.data || { CNYBRL: { bid: 0.7 } }
      const getCNY = parseFloat(
        (quotation as any).CNYBRL?.bid?.toString() || '0.7',
      )

      const where: Prisma.ProductCatalogWhereInput = {
        itemId: { not: 'MLB1965269525' },
        isSimilar: true,
        salesQuantity: { gt: 0 },
        ...(priceMin && {
          price: { gte: priceMin },
        }),
        ...(priceMax && {
          price: { lte: priceMax },
        }),
      }

      let orderByClause: Prisma.ProductCatalogOrderByWithRelationInput = {
        salesQuantity: 'desc',
      }

      if (orderBy) {
        const orderByOptions: Record<
          string,
          Prisma.ProductCatalogOrderByWithRelationInput
        > = {
          price_up: { price: 'asc' },
          price_down: { price: 'desc' },
          default: { createdAt: 'desc' },
        }

        if (orderByOptions[orderBy]) {
          orderByClause = orderByOptions[orderBy]
        }
      }

      const top300 = await this.prisma.productCatalog.findMany({
        where,
        orderBy: orderByClause,
        take: 300,
        distinct: ['itemId'],
      })

      const filteredByQuotation = top300.filter((product) => {
        const product1688Price =
          (product.metadata as any)?.product1688?.price || 0
        const mlbPrice = Number(product.price)
        return mlbPrice > product1688Price * 2 * getCNY
      })

      const shuffled = filteredByQuotation.sort(() => Math.random() - 0.5)

      const perPage = 20
      const currentPage = page
      const total = filteredByQuotation.length

      const startIndex = (currentPage - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedProducts = shuffled.slice(startIndex, endIndex)

      const result = {
        status: 'success',
        data: paginatedProducts,
        meta: {
          total,
          perPage,
          currentPage,
          lastPage: Math.ceil(total / perPage),
        },
      }

      await this.cacheManager.set(cacheKey, result, 600000)

      return result
    } catch (error: any) {
      this.logger.error('Erro ao buscar produtos populares', {
        error: error.message,
        stack: error.stack,
      })
      throw error
    }
  }
}
