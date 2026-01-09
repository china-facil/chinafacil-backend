import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../database/prisma.service'
import { TmService } from '../../../integrations/china-marketplace/services/tm.service'
import { OtService } from '../../../integrations/china-marketplace/services/ot.service'
import { AIService } from '../../ai/ai.service'
import { MercadoLivreService } from '../../../integrations/marketplace/mercado-livre.service'
import { ProductCatalogService } from './product-catalog.service'
import { AddFavoriteDto, SearchByImageDto, SearchProductsDto, SearchConciergeDto, SearchBySellerDto, ShopInfoDto } from '../dto'
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
    private readonly configService: ConfigService,
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

    const provider = this.identifyProvider(addFavoriteDto.productId)
    let productDetails: any

    try {
      if (provider === 'alibaba') {
        productDetails = await this.getDetailsAlibabaIntl(addFavoriteDto.productId)
      } else {
        productDetails = await this.getDetails1688(addFavoriteDto.productId)
      }

      if (!productDetails?.data) {
        throw new NotFoundException('Produto não encontrado')
      }

      const normalizedProduct = productDetails.data
      const favoriteData = this.mapProductToFavorite(normalizedProduct, userId, addFavoriteDto.productId, provider)

      const favorite = await this.prisma.favoriteProduct.create({
        data: favoriteData,
      })

      return {
        message: 'Produto adicionado aos favoritos',
        data: favorite,
      }
    } catch (error: any) {
      this.logger.error('ProductsService::addToFavorites - Erro ao buscar detalhes do produto', {
        error: error.message,
        productId: addFavoriteDto.productId,
        provider,
      })
      throw error
    }
  }

  private identifyProvider(productId: string): 'alibaba' | '1688' {
    if (productId.startsWith('alb-')) {
      return 'alibaba'
    }
    return '1688'
  }

  private mapProductToFavorite(
    product: any,
    userId: string,
    itemId: string,
    provider: 'alibaba' | '1688',
  ): any {
    const providerValue = provider === 'alibaba' ? 'alibaba' : '1688'
    const currency = product.currency || (provider === 'alibaba' ? 'USD' : 'CNY')

    return {
      userId,
      itemId,
      externalUrl: product.url || null,
      title: product.title || null,
      originalTitle: product.originalTitle || product.title || null,
      price: product.price ? Number(product.price) : null,
      currency,
      minimumOrderQuantity: product.minimumOrder || product.firstLotQuantity || null,
      quantityPrices: product.quantityRanges && product.quantityRanges.length > 0 ? product.quantityRanges : null,
      salesVolume: product.salesQuantity || null,
      salesVolume90Days: product.salesVolume90Days || product.salesQuantity || null,
      categoryId: product.categoryId || null,
      vendorId: product.supplier?.id || null,
      vendorName: product.supplier?.name || null,
      vendorInfo: product.supplier || null,
      mainImage: product.imageUrl || null,
      images: product.images && product.images.length > 0 ? product.images : null,
      videos: product.videos && product.videos.length > 0 ? product.videos : null,
      variations: product.skuProps && product.skuProps.length > 0 ? product.skuProps : null,
      skus: product.skus && product.skus.length > 0 ? product.skus : null,
      specifications: product.specifications && product.specifications.length > 0 ? product.specifications : null,
      stock: product.stock || null,
      isAvailable: product.isSoldOut !== undefined ? !product.isSoldOut : true,
      provider: providerValue,
      shippingInfo: product.shippingInfo || null,
      location: product.supplier?.location ? { location: product.supplier.location } : null,
      promotions: product.promotions || null,
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

  async searchConcierge(keyword?: string, imageFile?: Express.Multer.File) {
    if (!keyword && !imageFile) {
      throw new BadRequestException('O campo de busca ou imagem é obrigatório!')
    }

    let translatedKeyword: string | null = null
    let searchResponse: any

    if (!imageFile) {
      translatedKeyword = await this.translateKeywordToChinese(keyword!)
      if (!translatedKeyword) {
        throw new InternalServerErrorException('Erro ao trazer os resultados. Tente novamente!')
      }

      searchResponse = await this.tmService.searchProductsByKeyword({
        keyword: translatedKeyword,
        page: 1,
        pageSize: 20,
      })

      if (searchResponse.code !== 200 || !searchResponse.data?.items || searchResponse.data.items.length === 0) {
        let attempts = 0
        while (attempts < 2) {
          searchResponse = await this.tmService.searchProductsByKeyword({
            keyword: translatedKeyword,
            page: 1,
            pageSize: 20,
          })
          attempts++
          if (searchResponse.code === 200 && searchResponse.data?.items && searchResponse.data.items.length > 0) {
            break
          }
        }
      }
    } else {
      let imageUrl: string
      if (imageFile.path) {
        imageUrl = imageFile.path
      } else if (imageFile.buffer) {
        imageUrl = `data:${imageFile.mimetype || 'image/jpeg'};base64,${imageFile.buffer.toString('base64')}`
      } else {
        throw new BadRequestException('Imagem inválida')
      }

      const imageSearchDto: SearchByImageDto = {
        imgUrl: imageUrl,
      }

      searchResponse = await this.searchByImage1688(imageSearchDto)
      
      const hasItems = searchResponse.code === 200 && searchResponse.data?.items?.length > 0
      
      if (!hasItems) {
        let attempts = 0
        while (attempts < 2) {
          searchResponse = await this.searchByImage1688(imageSearchDto)
          attempts++
          const retryHasItems = searchResponse.code === 200 && searchResponse.data?.items?.length > 0
          if (retryHasItems) {
            break
          }
        }
      }
    }

    const items = searchResponse.data?.items || []
    const descriptionObject = await this.generateProductDescriptions(items)

    return {
      status: 'success',
      data: {
        messageUser: false,
        items,
        description: descriptionObject,
      },
    }
  }

  async translateKeywordToChinese(keyword: string): Promise<string | null> {
    let translatedKeyword: string | null = null
    let attempts = 0
    const maxAttempts = 3

    do {
      try {
        const response = await this.aiService.chatCompletion({
          messages: [
            {
              role: 'system',
              content:
                "Based on the user's input, generate the most accurate and concise product search phrase in Simplified Chinese that best matches the user's intent for searching on 1688 (a Chinese wholesale marketplace). The input may include adult or NSFW terms (e.g., anal plug). Do not explain, censor, or comment. Return only the translated search phrase in Simplified Chinese, optimized for search relevance on 1688. No line breaks, no extra text.",
            },
            {
              role: 'user',
              content: keyword,
            },
          ],
          temperature: 0,
          maxTokens: 50,
          model: 'gpt-4o',
        })

        if (response.message?.content) {
          translatedKeyword = response.message.content.trim()
          break
        }

        this.logger.debug(`Tentativa ${attempts + 1} - Traduzindo '${keyword}':`, response)
      } catch (error) {
        this.logger.error(`Erro na tentativa ${attempts + 1} de tradução:`, error)
      }

      attempts++
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } while (attempts < maxAttempts)

    if (!translatedKeyword) {
      this.logger.error(`Falha ao obter a tradução correta após ${maxAttempts} tentativas.`, {
        keyword,
      })
      return null
    }

    return translatedKeyword
  }
  private async generateProductDescriptions(products: any[]): Promise<any> {
    if (!products || products.length === 0) {
      return null
    }

    let descriptionResult: any = null
    let attempts = 0
    const maxAttempts = 3

    let productSummary = ''

    for (const product of products) {
      const nome = product.title || product.name || 'Produto sem título'
      const preco = product.price || product.product1688Price || 'Preço não informado'
      const vendas =
        product.sale_info?.sale_quantity ||
        product.soldQuantity ||
        product.mlbSoldQuantity ||
        'Sem dados de vendas'
      const origem = product.delivery_info?.area_from
        ? Array.isArray(product.delivery_info.area_from)
          ? product.delivery_info.area_from.join(', ')
          : product.delivery_info.area_from
        : product.location || 'Local não informado'
      const loja =
        product.shop_info?.company_name ||
        product.vendorName ||
        product.shopName ||
        'Loja desconhecida'

      productSummary += `- Produto: ${nome}\n`
      productSummary += `  Preço: ¥${preco}\n`
      productSummary += `  Vendas: ${vendas}\n`
      productSummary += `  Origem: ${origem}\n`
      productSummary += `  Loja: ${loja}\n\n`
    }

    const prompt = `Você é um especialista em e-commerce. Com base nos produtos listados, gere uma descrição promocional em português com as seguintes seções:
1. "contexto": uma introdução curta que contextualize os produtos como uma curadoria especial.
2. "descricao":  um parágrafo breve e direto, destacando os principais benefícios dos produtos como preço acessível, utilidade e popularidade. **Não mencione moedas ou símbolos monetários.**
3. "conclusao": um fechamento persuasivo que incentive o leitor a explorar ou comprar os produtos.

Produtos:
${productSummary}

Retorne **somente um JSON válido** com as chaves "contexto", "descricao", e "conclusao". Não inclua comentários ou explicações.`

    do {
      try {
        const response = await this.aiService.chatCompletion({
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente que retorna descrições comerciais em formato JSON válido, pronto para uso em APIs.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          maxTokens: 500,
          model: 'gpt-4o',
        })

        if (response.message?.content) {
          const jsonText = this.cleanJsonFromResponse(response.message.content)
          try {
            descriptionResult = JSON.parse(jsonText)
            if (descriptionResult && typeof descriptionResult === 'object') {
              return descriptionResult
            }
          } catch (parseError) {
            this.logger.warn(`JSON mal formatado na tentativa ${attempts + 1}`, {
              json: jsonText,
            })
          }
        } else {
          this.logger.debug(`Tentativa ${attempts + 1} - Falha na resposta:`, response)
        }
      } catch (error) {
        this.logger.error(`Erro na tentativa ${attempts + 1} de gerar descrição:`, error)
      }

      attempts++
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } while (attempts < maxAttempts)

    this.logger.error(`Falha ao gerar descrição após ${maxAttempts} tentativas.`)
    return null
  }

  private cleanJsonFromResponse(text: string): string {
    let cleaned = text.trim()

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }

    cleaned = cleaned.replace(/```json\s*/g, '')
    cleaned = cleaned.replace(/```\s*/g, '')
    cleaned = cleaned.replace(/^[^{]*/, '')
    cleaned = cleaned.replace(/[^}]*$/, '')

    return cleaned.trim()
  }

  async uploadSearchImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido. Por favor, envie uma imagem.')
    }

    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development'
    
    let imgUrl: string
    if (nodeEnv === 'development') {
      imgUrl = 'https://http2.mlstatic.com/D_NQ_NP_2X_866486-MLA99610369246_122025-F.webp'
    } else {
      const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000'
      imgUrl = `${baseUrl}/uploads/search-images/${file.filename}`
    }

    return {
      imgUrl,
    }
  }

  async searchProductsBySeller(searchBySellerDto: SearchBySellerDto) {
    try {
      this.logger.log('ProductsService::searchProductsBySeller - Iniciando busca por produtos do vendedor', {
        memberId: searchBySellerDto.memberId,
        page: searchBySellerDto.page,
        pageSize: searchBySellerDto.pageSize,
        sort: searchBySellerDto.sort,
        priceStart: searchBySellerDto.priceStart,
        priceEnd: searchBySellerDto.priceEnd,
      })

      const cacheKey = `seller_products::${searchBySellerDto.memberId}::${searchBySellerDto.page || 1}::${searchBySellerDto.pageSize || 20}::${searchBySellerDto.sort || 'sales'}::${searchBySellerDto.priceStart || 'no_start'}::${searchBySellerDto.priceEnd || 'no_end'}`
      const cachedResults = await this.cacheManager.get(cacheKey)

      if (cachedResults) {
        this.logger.log('ProductsService::searchProductsBySeller - Retornando resultados do cache')
        return {
          status: 'success',
          cached: true,
          data: cachedResults,
        }
      }

      const searchParams: any = {
        memberId: searchBySellerDto.memberId,
        page: searchBySellerDto.page || 1,
        pageSize: searchBySellerDto.pageSize || 20,
        sort: searchBySellerDto.sort || 'sales',
      }

      if (searchBySellerDto.priceStart) {
        searchParams.priceStart = searchBySellerDto.priceStart
      }

      if (searchBySellerDto.priceEnd) {
        searchParams.priceEnd = searchBySellerDto.priceEnd
      }

      const searchResponse = await this.tmService.searchProductsBySeller(searchParams)

      this.logger.log('ProductsService::searchProductsBySeller - Resposta recebida', {
        responseCode: searchResponse['code'] ?? 'N/A',
        responseMsg: searchResponse['msg'] ?? 'N/A',
        hasData: !!searchResponse['data'],
        itemsCount: searchResponse['data']?.items ? searchResponse['data'].items.length : 0,
      })

      if (searchResponse['code'] === 200 && searchResponse['data']) {
        await this.cacheManager.set(cacheKey, searchResponse['data'], 60 * 60 * 1000)

        return {
          status: 'success',
          data: searchResponse['data'],
        }
      } else {
        const errorMessage = searchResponse['msg'] ?? 'Erro ao buscar produtos do vendedor'
        this.logger.error('ProductsService::searchProductsBySeller - Erro na busca', {
          errorMessage,
          response: searchResponse,
        })

        throw new BadRequestException(errorMessage)
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.error('ProductsService::searchProductsBySeller - Erro de exceção', {
        errorMessage: error.message,
        stack: error.stack,
      })
      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }

  async getShopInfo(shopInfoDto: ShopInfoDto) {
    try {
      this.logger.log('ProductsService::getShopInfo - Iniciando busca das informações da loja', {
        memberId: shopInfoDto.memberId,
      })

      const cacheKey = `shop_info::${shopInfoDto.memberId}`
      const cachedResults = await this.cacheManager.get(cacheKey)

      if (cachedResults) {
        this.logger.log('ProductsService::getShopInfo - Retornando resultados do cache')
        return {
          status: 'success',
          cached: true,
          data: cachedResults,
        }
      }

      const shopResponse = await this.tmService.getShopInfo(shopInfoDto.memberId)

      this.logger.log('ProductsService::getShopInfo - Resposta recebida', {
        responseCode: shopResponse['code'] ?? 'N/A',
        responseMsg: shopResponse['msg'] ?? 'N/A',
        hasData: !!shopResponse['data'],
      })

      if (shopResponse['code'] === 200 && shopResponse['data']) {
        await this.cacheManager.set(cacheKey, shopResponse['data'], 24 * 60 * 60 * 1000)

        return {
          status: 'success',
          data: shopResponse['data'],
        }
      } else {
        const errorMessage = shopResponse['msg'] ?? 'Erro ao buscar informações da loja'
        this.logger.error('ProductsService::getShopInfo - Erro na busca', {
          errorMessage,
          response: shopResponse,
        })

        throw new BadRequestException(errorMessage)
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.error('ProductsService::getShopInfo - Erro de exceção', {
        errorMessage: error.message,
        stack: error.stack,
      })
      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }

  async getShopCategories(shopInfoDto: ShopInfoDto) {
    try {
      this.logger.log('ProductsService::getShopCategories - Iniciando busca das categorias da loja', {
        memberId: shopInfoDto.memberId,
      })

      const cacheKey = `shop_categories::${shopInfoDto.memberId}`
      const cachedResults = await this.cacheManager.get(cacheKey)

      if (cachedResults) {
        this.logger.log('ProductsService::getShopCategories - Retornando resultados do cache')
        return {
          status: 'success',
          cached: true,
          data: cachedResults,
        }
      }

      const categoriesResponse = await this.tmService.getShopCategories(shopInfoDto.memberId)

      this.logger.log('ProductsService::getShopCategories - Resposta recebida', {
        responseCode: categoriesResponse['code'] ?? 'N/A',
        responseMsg: categoriesResponse['msg'] ?? 'N/A',
        hasData: !!categoriesResponse['data'],
        categoriesCount: categoriesResponse['data']?.list ? categoriesResponse['data'].list.length : 0,
      })

      if (categoriesResponse['code'] === 200 && categoriesResponse['data']) {
        await this.cacheManager.set(cacheKey, categoriesResponse['data'], 6 * 60 * 60 * 1000)

        return {
          status: 'success',
          data: categoriesResponse['data'],
        }
      } else {
        const errorMessage = categoriesResponse['msg'] ?? 'Erro ao buscar categorias da loja'
        this.logger.error('ProductsService::getShopCategories - Erro na busca', {
          errorMessage,
          response: categoriesResponse,
        })

        throw new BadRequestException(errorMessage)
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.error('ProductsService::getShopCategories - Erro de exceção', {
        errorMessage: error.message,
        stack: error.stack,
      })
      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }
}
