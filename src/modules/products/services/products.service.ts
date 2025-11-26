import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { TmService } from '../../../integrations/china-marketplace/services/tm.service'
import { OtService } from '../../../integrations/china-marketplace/services/ot.service'
import { AddFavoriteDto, SearchByImageDto, SearchProductsDto } from '../dto'
import { ProductNormalizerService } from './normalizers/product-normalizer.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmService: TmService,
    private readonly otService: OtService,
    private readonly normalizer: ProductNormalizerService,
  ) {}

  async search1688(searchDto: SearchProductsDto) {
    return this.tmService.searchProductsByKeyword({
      keyword: searchDto.keyword,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
      sort: searchDto.sort,
      priceStart: searchDto.priceStart,
      priceEnd: searchDto.priceEnd,
    })
  }

  async searchAlibabaIntl(searchDto: SearchProductsDto) {
    return this.otService.searchProductsByKeywordAlibaba({
      keyword: searchDto.keyword,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
      sort: searchDto.sort,
    })
  }

  async searchByImage1688(searchDto: SearchByImageDto) {
    return this.tmService.searchProductsByImage({
      imgUrl: searchDto.imgUrl,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
      sort: searchDto.sort,
      priceStart: searchDto.priceStart,
      priceEnd: searchDto.priceEnd,
    })
  }

  async searchByImageAlibabaIntl(searchDto: SearchByImageDto) {
    return this.otService.searchProductsByImageAlibaba({
      imgUrl: searchDto.imgUrl,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    })
  }

  async getDetails1688(itemId: string) {
    return this.tmService.getProductDetails(itemId)
  }

  async getDetailsAlibabaIntl(productId: string) {
    return this.otService.getProductDetailsAlibaba(productId)
  }

  async getSku1688(itemId: string) {
    return this.tmService.getProductSkuDetails(itemId)
  }

  async getShipping1688(params: {
    itemId: string
    quantity: number
    province?: string
    city?: string
  }) {
    return this.tmService.getProductShipping(params)
  }

  async addToFavorites(userId: string, addFavoriteDto: AddFavoriteDto) {
    const existing = await this.prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: addFavoriteDto.productId,
        },
      },
    })

    if (existing) {
      return {
        message: 'Produto já está nos favoritos',
        data: existing,
      }
    }

    const favorite = await this.prisma.favoriteProduct.create({
      data: {
        userId,
        productId: addFavoriteDto.productId,
        productData: addFavoriteDto.productData,
      },
    })

    return {
      message: 'Produto adicionado aos favoritos',
      data: favorite,
    }
  }

  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await this.prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado')
    }

    await this.prisma.favoriteProduct.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return {
      message: 'Produto removido dos favoritos',
    }
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favoriteProduct.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return favorites
  }

  async searchMixed(searchDto: SearchProductsDto) {
    const [results1688, resultsAlibaba] = await Promise.allSettled([
      this.search1688(searchDto),
      this.searchAlibabaIntl(searchDto),
    ])

    const items1688 = 
      results1688.status === 'fulfilled' && results1688.value?.data?.items
        ? results1688.value.data.items
        : []

    const itemsAlibaba =
      resultsAlibaba.status === 'fulfilled' && resultsAlibaba.value?.data?.items
        ? resultsAlibaba.value.data.items
        : []

    const allItems = [...items1688, ...itemsAlibaba]

    return {
      code: 200,
      msg: 'success',
      data: {
        items: allItems,
        total: allItems.length,
        sources: {
          alibaba1688: items1688.length,
          alibabaIntl: itemsAlibaba.length,
        },
      },
    }
  }
}


