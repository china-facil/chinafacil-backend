import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { TmService } from '../../../integrations/china-marketplace/services/tm.service'
import { OtService } from '../../../integrations/china-marketplace/services/ot.service'
import { AIService } from '../../ai/ai.service'
import { MercadoLivreService } from '../../../integrations/marketplace/mercado-livre.service'
import { ProductCatalogService } from './product-catalog.service'
import { AddFavoriteDto, SearchByImageDto, SearchProductsDto } from '../dto'
import { ProductNormalizerService } from './normalizers/product-normalizer.service'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly tmService: TmService,
    private readonly otService: OtService,
    private readonly normalizer: ProductNormalizerService,
    private readonly aiService: AIService,
    private readonly mercadoLivreService: MercadoLivreService,
    private readonly productCatalogService: ProductCatalogService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const response = await this.tmService.getProductDetails(itemId)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro na requisição')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    return response
  }

  async getDetailsAlibabaIntl(productId: string) {
    const response = await this.otService.getProductDetailsAlibaba(productId)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro na requisição')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    return response
  }

  async getSku1688(itemId: string) {
    const response = await this.tmService.getProductSkuDetails(itemId)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro na requisição')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    return response
  }

  async getShipping1688(params: {
    itemId: string
    quantity: number
    province?: string
    city?: string
  }) {
    const response = await this.tmService.getProductShipping(params)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro na requisição')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    return response
  }

  async show(id: string) {
    this.logger.log(`ProductsService::show - Iniciando busca para produto ID: ${id}`)

    const isAlibabaProduct = id.startsWith('alb-')

    if (isAlibabaProduct) {
      this.logger.log(`ProductsService::show - Produto identificado como Alibaba: ${id}`)
      return this.getDetailsAlibabaIntl(id.replace('alb-', ''))
    }

    const cacheKey = `product_options::${id}`
    const cachedProductOptions = await this.cacheManager.get(cacheKey)
    if (cachedProductOptions) {
      this.logger.log(`ProductsService::show - Produto encontrado no cache: ${id}`)
      return {
        status: 'success',
        cached: true,
        data: cachedProductOptions,
      }
    }

    const localProduct = await this.prisma.productCatalog.findFirst({
      where: { product1688Id: id },
    })

    if (localProduct) {
      this.logger.log(`ProductsService::show - Produto encontrado no banco local: ${id}`)
      const response = await this.tmService.getProductDetails(id)

      if (response?.code && response.code !== 200) {
        if (response.code === 404) {
          throw new NotFoundException(response.msg || 'Produto não encontrado')
        }
        if (response.code >= 400 && response.code < 500) {
          throw new BadRequestException(response.msg || 'Erro ao buscar detalhes do produto')
        }
        throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
      }

      if (response?.data && Object.keys(response.data).length > 0) {
        const productData = response.data
        await this.cacheManager.set(cacheKey, productData, 24 * 60 * 60 * 1000)
        return {
          status: 'success',
          data: productData,
          source: 'tmservice_from_catalog',
        }
      }
    }

    this.logger.log(`ProductsService::show - Chamando tmService para: ${id}`)

    try {
      const response = await this.tmService.getProductDetails(id)

      if (response?.code && response.code !== 200) {
        if (response.code === 404) {
          throw new NotFoundException(response.msg || 'Produto não encontrado')
        }
        if (response.code >= 400 && response.code < 500) {
          throw new BadRequestException(response.msg || 'Erro ao buscar detalhes do produto')
        }
        throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
      }

      if (!response?.data || Object.keys(response.data).length === 0) {
        await this.cacheManager.set(cacheKey, { removed: true, removedAt: new Date() }, 24 * 60 * 60 * 1000)
        throw new NotFoundException('Este produto não está mais disponível no fornecedor')
      }

      const product = response.data
      await this.cacheManager.set(cacheKey, product, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product,
        source: 'external',
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error
      }
      this.logger.error(`ProductsService::show - Erro no tmService: ${id}`, error.message)
      throw new InternalServerErrorException('Erro interno do servidor ao buscar produto')
    }
  }

  async getProductDetails(id: string) {
    const cacheKey = `product_details::${id}`
    const cachedProductDetails = await this.cacheManager.get(cacheKey)
    if (cachedProductDetails) {
      return {
        status: 'success',
        cached: true,
        data: cachedProductDetails,
      }
    }

    const response = await this.tmService.getProductDetails(id)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro ao buscar detalhes do produto')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    const product = response?.data
    if (product?.product_props) {
      await this.cacheManager.set(cacheKey, product.product_props, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product.product_props,
      }
    }

    throw new NotFoundException('Propriedades do produto não encontradas')
  }

  async getProductSkuDetails(id: string) {
    const cacheKey = `product_details_skul::${id}`
    const cachedProductDetails = await this.cacheManager.get(cacheKey)
    if (cachedProductDetails) {
      return {
        status: 'success',
        cached: true,
        data: cachedProductDetails,
      }
    }

    const response = await this.tmService.getProductDetails(id)
    
    if (response?.code && response.code !== 200) {
      if (response.code === 404) {
        throw new NotFoundException(response.msg || 'Produto não encontrado')
      }
      if (response.code >= 400 && response.code < 500) {
        throw new BadRequestException(response.msg || 'Erro ao buscar SKUs do produto')
      }
      throw new InternalServerErrorException(response.msg || 'Erro interno do servidor')
    }
    
    const product = response?.data
    if (product?.skus) {
      await this.cacheManager.set(cacheKey, product.skus, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product.skus,
      }
    }

    throw new NotFoundException('SKUs do produto não encontrados')
  }

  async getProductStatistics(itemId: string) {
    const result = await this.tmService.getProductStatistics(itemId)
    
    if (result?.code && result.code !== 200) {
      if (result.code === 404) {
        throw new NotFoundException(result.msg || 'Produto não encontrado')
      }
      if (result.code >= 400 && result.code < 500) {
        throw new BadRequestException(result.msg || 'Erro ao buscar estatísticas do produto')
      }
      throw new InternalServerErrorException(result.msg || 'Erro interno do servidor')
    }
    
    return result
  }

  async getProductDescription(itemId: string) {
    const cacheKey = `product_description::${itemId}`
    const cachedDescription = await this.cacheManager.get(cacheKey)
    if (cachedDescription) {
      return {
        status: 'success',
        cached: true,
        data: cachedDescription,
      }
    }

    const result = await this.tmService.getProductDescription(itemId)

    if (result?.code && result.code !== 200) {
      if (result.code === 404) {
        throw new NotFoundException(result.msg || 'Produto não encontrado')
      }
      if (result.code >= 400 && result.code < 500) {
        throw new BadRequestException(result.msg || 'Erro ao buscar descrição do produto')
      }
      throw new InternalServerErrorException(result.msg || 'Erro interno do servidor')
    }

    if (result && result.code === 200 && result.data) {
      await this.cacheManager.set(cacheKey, result.data, 24 * 60 * 60 * 1000)
    }

    return result
  }

  async getCategoryInfo(categoryId: string) {
    try {
      const result = await this.tmService.getCategoryInfo(categoryId)
      return result
    } catch (error) {
      this.logger.error(`ProductsService::getCategoryInfo - Erro: ${categoryId}`, error.message)
      return {
        code: 500,
        msg: 'Erro interno do servidor',
        data: null,
      }
    }
  }

  async addToFavorites(userId: string, addFavoriteDto: AddFavoriteDto) {
    const existing = await this.prisma.favoriteProduct.findFirst({
      where: {
        userId,
        itemId: addFavoriteDto.productId,
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
        itemId: addFavoriteDto.productId,
      },
    })

    return {
      message: 'Produto adicionado aos favoritos',
      data: favorite,
    }
  }

  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await this.prisma.favoriteProduct.findFirst({
      where: {
        userId,
        itemId: productId,
      },
    })

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado')
    }

    await this.prisma.favoriteProduct.delete({
      where: {
        id: favorite.id,
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

  async suggestionsCnae(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.companyData) {
      throw new BadRequestException(
        'Dados da empresa não encontrados para o usuário.',
      )
    }

    const cacheKey = `suggestions_cnae::${userId}`
    const suggestionsCached = await this.cacheManager.get(cacheKey)
    if (suggestionsCached) {
      return {
        status: 'success',
        cached: true,
        data: suggestionsCached,
      }
    }

    const companyData =
      typeof user.companyData === 'string'
        ? JSON.parse(user.companyData)
        : user.companyData

    if (
      !companyData ||
      !companyData.mainActivity ||
      !companyData.mainActivity.text
    ) {
      throw new BadRequestException(
        'CNAE principal inválido ou não encontrado.',
      )
    }

    const cnaeText = companyData.mainActivity.text

    const prompt = `Você é um especialista em importação de produtos da China. Baseado na seguinte descrição de atividade econômica (CNAE) de uma empresa brasileira:

"${cnaeText}"

Gere uma lista curta (8 itens) com sugestões de tipos de produtos que essa empresa poderia importar da China para revenda, considerando o mercado brasileiro. Retorne a lista com os nomes dos produtos em chinês, nao censure palavras +18

Formato de saída: **apenas um JSON válido**, com uma chave chamada "produtos" contendo um array de strings (cada uma sendo um termo em chinês).

Exemplo de saída:
{
  "produtos": ["produto1", "produto2", "produto3"]
}`

    try {
      const response = await this.aiService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que responde apenas com JSON válido para APIs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 500,
      })

      const jsonText = this.cleanJsonFromResponse(
        (response as any).message?.content || '',
      )
      const result = JSON.parse(jsonText)

      if (result && Array.isArray(result.produtos)) {
        const finalResults = []

        for (const keyword of result.produtos) {
          try {
            const searchResponse = await this.tmService.searchProductsByKeyword({
              keyword,
              page: 1,
              pageSize: 1,
            })

            if (
              searchResponse.code === 200 &&
              searchResponse.data?.items?.length > 0
            ) {
              finalResults.push(searchResponse.data.items[0])
            } else {
              let attempts = 0
              while (attempts < 2) {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const retryResponse =
                  await this.tmService.searchProductsByKeyword({
                    keyword,
                    page: 1,
                    pageSize: 1,
                  })
                if (
                  retryResponse.code === 200 &&
                  retryResponse.data?.items?.length > 0
                ) {
                  finalResults.push(retryResponse.data.items[0])
                  break
                }
                attempts++
              }
            }
          } catch (error) {
            this.logger.warn(`Erro ao buscar produto para keyword ${keyword}`, {
              error: error.message,
            })
          }
        }

        await this.cacheManager.set(cacheKey, finalResults, 86400000)

        return {
          status: 'success',
          data: finalResults,
          cached: false,
        }
      } else {
        this.logger.warn('Resposta com JSON mal formatado ou sem chave "produtos"', {
          json: jsonText,
        })
        throw new BadRequestException('Falha ao gerar sugestões de produtos.')
      }
    } catch (error: any) {
      this.logger.error('Falha na API OpenAI ao gerar sugestões por CNAE', {
        error: error.message,
        stack: error.stack,
      })
      throw new BadRequestException('Falha ao gerar sugestões de produtos.')
    }
  }

  private cleanJsonFromResponse(response: string): string {
    return response.replace(/```(?:json)?\s*(.*?)```/s, '$1').trim()
  }

  async getCategories(parentCategoryId?: string, forceRefresh = false) {
    if (parentCategoryId) {
      return this.getSubcategories(parentCategoryId, forceRefresh)
    }

    const cacheKey = 'categories'
    const cachedCategories = await this.cacheManager.get(cacheKey)
    if (cachedCategories && !forceRefresh) {
      return {
        status: 'success',
        cached: true,
        data: cachedCategories,
      }
    }

    try {
      let categories = await this.mercadoLivreService.categoriesList()

      if ((categories as any)?.code === 'unauthorized') {
        this.logger.error(
          'Erro de autenticação MercadoLivre ao buscar categorias',
          categories,
        )

        await this.cacheManager.del('ml_access_token')

        categories = await this.mercadoLivreService.categoriesList()

        if ((categories as any)?.code === 'unauthorized') {
          return {
            status: 'error',
            message: 'Erro de autenticação com MercadoLivre',
            data: categories,
          }
        }
      }

      if (Array.isArray(categories) && !(categories as any).code) {
        await this.cacheManager.set(cacheKey, categories, 86400000)
      }

      return {
        status: 'success',
        data: categories,
      }
    } catch (error: any) {
      this.logger.error('Erro ao buscar categorias', {
        error: error.message,
        stack: error.stack,
      })
      throw new BadRequestException('Erro interno ao buscar categorias')
    }
  }

  private async getSubcategories(
    categoryId: string,
    forceRefresh = false,
  ) {
    const cacheKey = `subcategories_${categoryId}`
    const cached = await this.cacheManager.get(cacheKey)
    if (cached && !forceRefresh) {
      return {
        status: 'success',
        cached: true,
        data: cached,
      }
    }

    try {
      const category = await this.mercadoLivreService.getCategoryById(categoryId)
      const subcategories = category?.children_categories || []

      await this.cacheManager.set(cacheKey, subcategories, 86400000)

      return {
        status: 'success',
        data: subcategories,
      }
    } catch (error: any) {
      this.logger.error('Erro ao buscar subcategorias', {
        error: error.message,
        categoryId,
      })
      throw new BadRequestException('Erro ao buscar subcategorias')
    }
  }

  async getPopularProducts(options: {
    orderBy?: string
    priceMin?: number
    priceMax?: number
    page?: number
  }) {
    return this.productCatalogService.getPopularProducts(options)
  }

  async getProductsByCategory(options: {
    categoryId: string
    orderBy?: string
    priceMin?: number
    priceMax?: number
    page?: number
  }) {
    return this.productCatalogService.getProductsByCategory(options)
  }
}


