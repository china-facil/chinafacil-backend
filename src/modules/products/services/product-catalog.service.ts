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
        productMlbId: { not: 'MLB1965269525' },
        isSimilar: true,
        mlbSoldQuantity: { gt: 0 },
        ...(priceMin || priceMax
          ? {
              product1688Price: {
                ...(priceMin && { gte: priceMin }),
                ...(priceMax && { lte: priceMax }),
              },
            }
          : {}),
      }

      let orderByClause: Prisma.ProductCatalogOrderByWithRelationInput = {
        mlbSoldQuantity: 'desc',
      }

      if (orderBy) {
        const orderByOptions: Record<
          string,
          Prisma.ProductCatalogOrderByWithRelationInput
        > = {
          price_up: { product1688Price: 'asc' },
          price_down: { product1688Price: 'desc' },
          default: { product1688GoodsScore: 'desc' },
        }

        if (orderByOptions[orderBy]) {
          orderByClause = orderByOptions[orderBy]
        }
      }

      const top300Raw = await this.prisma.productCatalog.findMany({
        where,
        orderBy: orderByClause,
        take: 500,
      })

      // Remove duplicatas por productMlbId manualmente
      const seenItemIds = new Set<string>()
      const top300 = top300Raw.filter((product) => {
        if (seenItemIds.has(product.productMlbId)) {
          return false
        }
        seenItemIds.add(product.productMlbId)
        return true
      }).slice(0, 300)

      // Filtrar por margem de lucro (MLB price > 1688 price * 2 * cotação)
      const filteredByQuotation = top300.filter((product) => {
        try {
          const product1688Price = product.product1688Price
            ? Number(product.product1688Price)
            : 0
          const mlbPrice = product.mlbPrice ? Number(product.mlbPrice) : 0

          // Se não tiver preço do 1688 ou MLB, pular
          if (!product1688Price || !mlbPrice || isNaN(mlbPrice)) {
            return false
          }

          return mlbPrice > product1688Price * 2 * getCNY
        } catch (error) {
          this.logger.warn('Erro ao filtrar produto por cotação', {
            productMlbId: product.productMlbId,
            error: error.message,
          })
          return false
        }
      })

      const shuffled = filteredByQuotation.sort(() => Math.random() - 0.5)

      const perPage = 20
      const currentPage = page
      const total = filteredByQuotation.length

      const startIndex = (currentPage - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedProducts = shuffled.slice(startIndex, endIndex)

      // Transformar produtos para o formato esperado pelo frontend (mesmo formato do PHP)
      const transformedProducts = paginatedProducts.map((product) =>
        this.transformProductCatalogToResponse(product),
      )

      const result = {
        status: 'success',
        data: transformedProducts,
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
        code: error.code,
        meta: error.meta,
        name: error.name,
      })
      
      // Se for erro do Prisma, relançar para ser capturado pelo filtro de exceções
      if (error.code && error.meta) {
        throw error
      }
      
      // Para outros erros, lançar uma exceção genérica
      throw new Error(`Erro ao buscar produtos populares: ${error.message}`)
    }
  }

  async getProductsByCategory(options: {
    categoryId: string
    orderBy?: string
    priceMin?: number
    priceMax?: number
    page?: number
  }) {
    const { categoryId, orderBy, priceMin, priceMax, page = 1 } = options

    const cacheKey = `products_category:${categoryId}:${orderBy || 'default'}:${priceMin || ''}:${priceMax || ''}:${page}`

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

      // Buscar produtos onde categoryId está em categoryIds (JSON)
      // Como Prisma não suporta bem JSON_CONTAINS, vamos buscar todos e filtrar depois
      const where: Prisma.ProductCatalogWhereInput = {
        productMlbId: { not: 'MLB1965269525' },
        mlbSoldQuantity: { gt: 0 },
        categoryIds: { not: Prisma.JsonNull },
        ...(priceMin && priceMax
          ? { product1688Price: { gte: priceMin, lte: priceMax } }
          : priceMin
            ? { product1688Price: { gte: priceMin } }
            : priceMax
              ? { product1688Price: { lte: priceMax } }
              : {}),
      }

      let orderByClause: Prisma.ProductCatalogOrderByWithRelationInput = {
        mlbSoldQuantity: 'desc',
      }

      if (orderBy) {
        const orderByOptions: Record<
          string,
          Prisma.ProductCatalogOrderByWithRelationInput
        > = {
          price_up: { product1688Price: 'asc' },
          price_down: { product1688Price: 'desc' },
          default: { product1688GoodsScore: 'desc' },
        }

        if (orderByOptions[orderBy]) {
          orderByClause = orderByOptions[orderBy]
        }
      }

      const top300Raw = await this.prisma.productCatalog.findMany({
        where,
        orderBy: orderByClause,
        take: 500,
      })

      // Remove duplicatas por productMlbId manualmente
      const seenItemIds = new Set<string>()
      const top300 = top300Raw.filter((product) => {
        if (seenItemIds.has(product.productMlbId)) {
          return false
        }
        seenItemIds.add(product.productMlbId)
        return true
      }).slice(0, 300)

      // Filtrar por categoria primeiro (verificar se categoryId está no array categoryIds)
      const filteredByCategory = top300.filter((product) => {
        if (!product.categoryIds) return false
        const categoryIdsArray = Array.isArray(product.categoryIds)
          ? product.categoryIds
          : []
        return categoryIdsArray.includes(categoryId)
      })

      // Filtrar por margem de lucro
      const filteredByQuotation = filteredByCategory.filter((product) => {
        const product1688Price = product.product1688Price
          ? Number(product.product1688Price)
          : 0
        const mlbPrice = product.mlbPrice ? Number(product.mlbPrice) : 0

        if (!product1688Price || !mlbPrice || isNaN(mlbPrice)) {
          return false
        }

        return mlbPrice > product1688Price * 2 * getCNY
      })

      const shuffled = filteredByQuotation.sort(() => Math.random() - 0.5)
      const randomProducts = shuffled.slice(0, 20)

      const perPage = 20
      const currentPage = page
      const total = filteredByQuotation.length

      const startIndex = (currentPage - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedProducts = randomProducts.slice(startIndex, endIndex)

      // Transformar produtos para o formato esperado pelo frontend (mesmo formato do PHP)
      const transformedProducts = paginatedProducts.map((product) =>
        this.transformProductCatalogToResponse(product, getCNY),
      )

      const result = {
        status: 'success',
        data: transformedProducts,
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
      this.logger.error('Erro ao buscar produtos por categoria', {
        error: error.message,
        stack: error.stack,
        categoryId,
      })
      throw error
    }
  }

  /**
   * Transforma um produto do catálogo para o formato esperado pelo frontend
   * Replica a lógica do ProductCatalogResource do PHP
   */
  private transformProductCatalogToResponse(product: any, getCNY: number = 0.7) {

    // Substituir I.jpg por O.webp na thumbnail (mesma lógica do PHP)
    const productMlbThumbnail = product.mlbThumbnail
      ? product.mlbThumbnail.replace('I.jpg', 'O.webp')
      : ''

    const product1688Price = product.product1688Price
      ? Number(product.product1688Price)
      : 0
    const mlbPrice = product.mlbPrice ? Number(product.mlbPrice) : 0

    // Calcular preço com margem (mesma lógica do PHP)
    const product1688PriceFormatted =
      (product1688Price * getCNY) * 2.4

    // Calcular ROI
    const roi =
      product1688PriceFormatted > 0
        ? ((mlbPrice - product1688PriceFormatted) / product1688PriceFormatted) *
          100
        : 0

    // Calcular gross_profit
    const totalCost = product1688Price * (product.mlbSoldQuantity || 0)
    const grossProfit = Math.abs(
      totalCost - (product.mlbSoldValue ? Number(product.mlbSoldValue) : 0),
    )

    return {
      id: product.id,
      item_id: product.product1688Id || null,
      img: productMlbThumbnail,
      title: product.mlbTitle || '',
      price: product.product1688Price ? Number(product.product1688Price) : 0,
      sold_quantity: product.mlbSoldQuantity ? Number(product.mlbSoldQuantity) : 0,
      goods_score: product.product1688GoodsScore
        ? Number(product.product1688GoodsScore)
        : 0,
      quantity_begin: product.product1688QuantityBegin
        ? Number(product.product1688QuantityBegin)
        : 1,
      permalink: product.mlbPermalink || '',
      is_similar: product.isSimilar ?? false,
      category_id: product.categoryId || null,
      product_mlb_id: product.productMlbId || null,
      product_mbl_thumbnail: productMlbThumbnail,
      product_mlb_price: product.mlbPrice
        ? `R$ ${Number(product.mlbPrice).toFixed(2).replace('.', ',')}`
        : 'R$ 0,00',
      product_mlb_sold_quantity: this.formatSoldQuantity(
        product.mlbSoldQuantity || 0,
      ),
      product_mlb_sold_value: this.formatSoldValue(product.mlbSoldValue || 0),
      product_mlb: {
        thumbnail: product.mlbThumbnail || '',
        title: product.mlbTitle || '',
        price: product.mlbPrice ? Number(product.mlbPrice) : 0,
        sold_quantity: product.mlbSoldQuantity ? Number(product.mlbSoldQuantity) : 0,
        sold_value: product.mlbSoldValue ? Number(product.mlbSoldValue) : 0,
        permalink: product.mlbPermalink || '',
      },
      product_1688_id: product.product1688Id || null,
      product_1688_price: `R$ ${product1688PriceFormatted
        .toFixed(2)
        .replace('.', ',')}`,
      product_1688: {
        price: product1688Price,
        goods_score: product.product1688GoodsScore
          ? Number(product.product1688GoodsScore)
          : 0,
        title: product.product1688Title || '',
        translated_title: product.product1688TranslatedTitle || '',
        quantity_begin: product.product1688QuantityBegin
          ? Number(product.product1688QuantityBegin)
          : 1,
      },
      roi: `${roi.toFixed(0).replace('.', ',')}%`,
      gross_profit: this.formatSoldValue(grossProfit),
      translated_title: product.product1688TranslatedTitle || '',
    }
  }

  /**
   * Formata quantidade vendida no formato do PHP (ex: "+1 M", "+1 mil", "+100")
   */
  private formatSoldQuantity(quantity: number): string {
    if (quantity >= 1000000) {
      return `+${(quantity / 1000000).toFixed(0).replace('.', ',')} M`
    } else if (quantity >= 1000) {
      return `+${(quantity / 1000).toFixed(0).replace('.', ',')} mil`
    }
    return `+${quantity.toFixed(0)}`
  }

  /**
   * Formata valor vendido no formato do PHP (ex: "R$ 1,0 M", "R$ 1 mil", "R$ 100,00")
   */
  private formatSoldValue(value: number): string {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0).replace('.', ',')} mil`
    }
    return `R$ ${value.toFixed(2).replace('.', ',')}`
  }
}
