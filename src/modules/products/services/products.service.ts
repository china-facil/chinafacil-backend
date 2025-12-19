import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { TmService } from '../../../integrations/china-marketplace/services/tm.service'
import { OtService } from '../../../integrations/china-marketplace/services/ot.service'
import { AIService } from '../../ai/ai.service'
import { OpenAIService } from '../../../integrations/ai-providers/openai/openai.service'
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
    private readonly openaiService: OpenAIService,
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
      try {
        const response = await this.tmService.getProductDetails(id)

        if (response?.data && Object.keys(response.data).length > 0) {
          const productData = response.data
          await this.cacheManager.set(cacheKey, productData, 24 * 60 * 60 * 1000)
          return {
            status: 'success',
            data: productData,
            source: 'tmservice_from_catalog',
          }
        }
      } catch (error) {
        this.logger.error(`ProductsService::show - Erro ao buscar dados via TmService: ${id}`, error.message)
      }
    }

    this.logger.log(`ProductsService::show - Chamando tmService para: ${id}`)

    try {
      const response = await this.tmService.getProductDetails(id)

      if (response?.code && response.code !== 200) {
        return {
          status: 'error',
          message: response.msg || 'Erro ao buscar detalhes do produto',
          code: response.code,
        }
      }

      if (!response?.data || Object.keys(response.data).length === 0) {
        await this.cacheManager.set(cacheKey, { removed: true, removedAt: new Date() }, 24 * 60 * 60 * 1000)
        return {
          status: 'error',
          message: 'Este produto não está mais disponível no fornecedor',
          code: 404,
        }
      }

      const product = response.data
      await this.cacheManager.set(cacheKey, product, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product,
        source: 'external',
      }
    } catch (error) {
      this.logger.error(`ProductsService::show - Erro no tmService: ${id}`, error.message)
      return {
        status: 'error',
        message: 'Erro interno do servidor ao buscar produto',
        code: 500,
      }
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
    const product = response?.data
    if (product?.product_props) {
      await this.cacheManager.set(cacheKey, product.product_props, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product.product_props,
      }
    }

    return {
      status: 'error',
      message: 'Erro ao buscar detalhes do produto',
      code: 500,
    }
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
    const product = response?.data
    if (product?.skus) {
      await this.cacheManager.set(cacheKey, product.skus, 24 * 60 * 60 * 1000)
      return {
        status: 'success',
        data: product.skus,
      }
    }

    return {
      status: 'error',
      message: 'Erro ao buscar SKUs do produto',
      code: 500,
    }
  }

  async getProductStatistics(itemId: string) {
    try {
      const result = await this.tmService.getProductStatistics(itemId)
      return result
    } catch (error) {
      this.logger.error(`ProductsService::getProductStatistics - Erro: ${itemId}`, error.message)
      return {
        code: 500,
        msg: 'Erro interno do servidor',
        data: null,
      }
    }
  }

  async getProductDescription(itemId: string) {
    try {
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

      if (result && result.code === 200 && result.data) {
        await this.cacheManager.set(cacheKey, result.data, 24 * 60 * 60 * 1000)
      }

      return result
    } catch (error) {
      this.logger.error(`ProductsService::getProductDescription - Erro: ${itemId}`, error.message)
      return {
        code: 500,
        msg: 'Erro interno do servidor',
        data: null,
      }
    }
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

  async searchConcierge(keyword?: string, image?: Express.Multer.File) {
    if (!keyword && !image) {
      throw new BadRequestException('O campo de busca ou imagem é obrigatório!')
    }

    let items: any[] = []

    if (image) {
      const base64Image = image.buffer.toString('base64')
      const imgUrl = `data:${image.mimetype};base64,${base64Image}`

      let searchResponse = await this.tmService.searchProductsByImage({
        imgUrl,
        page: 1,
        pageSize: 20,
      })

      if (searchResponse.code !== 200 || !searchResponse.data?.items?.length) {
        let attempts = 0
        while (attempts < 2) {
          searchResponse = await this.tmService.searchProductsByImage({
            imgUrl,
            page: 1,
            pageSize: 20,
          })
          if (searchResponse.code === 200 && searchResponse.data?.items?.length) {
            break
          }
          attempts++
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      items = searchResponse.data?.items || []
    } else if (keyword) {
      const translatedKeyword = await this.summarizeInputText(keyword)
      if (!translatedKeyword) {
        throw new BadRequestException('Erro ao trazer os resultados. Tente novamente!')
      }

      let searchResponse = await this.tmService.searchProductsByKeyword({
        keyword: translatedKeyword,
        page: 1,
        pageSize: 20,
      })

      if (searchResponse.code !== 200 || !searchResponse.data?.items?.length) {
        let attempts = 0
        while (attempts < 2) {
          searchResponse = await this.tmService.searchProductsByKeyword({
            keyword: translatedKeyword,
            page: 1,
            pageSize: 20,
          })
          if (searchResponse.code === 200 && searchResponse.data?.items?.length) {
            break
          }
          attempts++
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      items = searchResponse.data?.items || []
    }

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

  private async summarizeInputText(keyword: string): Promise<string | null> {
    const maxAttempts = 3
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await this.openaiService.chatCompletion({
          model: 'gpt-4o',
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
        })

        const translatedKeyword = (response as any).message?.content
        if (translatedKeyword) {
          return translatedKeyword
        }
      } catch (error) {
        this.logger.warn(`Tentativa ${attempts + 1} - Erro ao traduzir '${keyword}': ${error.message}`)
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    this.logger.error(`Falha ao obter a tradução correta após ${maxAttempts} tentativas.`)
    return null
  }

  private async generateProductDescriptions(products: any[]): Promise<{
    contexto: string
    descricao: string
    conclusao: string
  } | null> {
    if (!products.length) {
      return null
    }

    const maxAttempts = 3
    let attempts = 0

    let productSummary = ''
    for (const product of products.slice(0, 10)) {
      const nome = product.title || 'Produto sem título'
      const preco = product.price || 'Preço não informado'
      const vendas = product.sale_info?.sale_quantity || 'Sem dados de vendas'
      const origem = product.delivery_info?.area_from
        ? Array.isArray(product.delivery_info.area_from)
          ? product.delivery_info.area_from.join(', ')
          : product.delivery_info.area_from
        : 'Local não informado'
      const loja = product.shop_info?.company_name || 'Loja desconhecida'

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

    while (attempts < maxAttempts) {
      try {
        const response = await this.openaiService.chatCompletion({
          model: 'gpt-4o',
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
        })

        const content = (response as any).message?.content || ''
        const jsonText = this.cleanJsonFromResponse(content)
        const result = JSON.parse(jsonText)

        if (result && result.contexto && result.descricao && result.conclusao) {
          return result
        }
      } catch (error) {
        this.logger.warn(`Tentativa ${attempts + 1} - Erro ao gerar descrições: ${error.message}`)
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    this.logger.error(`Falha ao gerar descrições após ${maxAttempts} tentativas.`)
    return null
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

  async getFreightByUserAddress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    let address = user.addresses?.find((addr: any) => addr.id === user.defaultAddress)
    if (!address) {
      address = user.addresses?.[0]
    }

    if (!address) {
      return { status: 'success', data: null }
    }

    const userCepPrefix = parseInt(String(address.postalCode || '').replace(/[^0-9]/g, '').substring(0, 5), 10)

    const freights = await this.prisma.freight.findMany()

    let closestFreight: any = null
    let minDistance = Infinity

    for (const freight of freights) {
      const freightCepPrefix = parseInt(String(freight.cep || '').replace(/[^0-9]/g, '').substring(0, 5), 10)
      const distance = Math.abs(userCepPrefix - freightCepPrefix)

      if (distance < minDistance) {
        minDistance = distance
        closestFreight = freight
      }
    }

    return { status: 'success', data: closestFreight }
  }

  async getCbm(terms: string[], products?: any[]) {
    if (!Array.isArray(terms) || terms.length === 0) {
      throw new BadRequestException('Termos inválidos')
    }

    const results: any[] = []
    let successCount = 0
    let errorCount = 0

    for (let index = 0; index < terms.length; index++) {
      const term = terms[index]
      const productObject = products?.[index] || null

      try {
        const cacheKey = `cbm_peso_hybrid_${this.hashString(term)}`
        const cached = await this.cacheManager.get<any>(cacheKey)

        if (cached) {
          results.push(cached)
          successCount++
          continue
        }

        const result = await this.calculateProductCbm(term, productObject)
        await this.cacheManager.set(cacheKey, result, 7 * 24 * 60 * 60 * 1000)
        results.push(result)
        successCount++
      } catch (error) {
        this.logger.warn(`Erro ao calcular CBM para "${term}": ${error.message}`)
        results.push(this.createEmptyCbmResponse(term))
        errorCount++
      }
    }

    return {
      success: successCount > 0,
      data: results,
      message: errorCount > 0 ? `${successCount} produtos calculados, ${errorCount} com erro` : undefined,
    }
  }

  async getCbmIndividual(term: string, product?: any) {
    if (!term) {
      throw new BadRequestException('Termo inválido')
    }

    try {
      const cacheKey = `cbm_peso_hybrid_${this.hashString(term)}`
      const cached = await this.cacheManager.get<any>(cacheKey)

      if (cached) {
        return { success: true, data: cached }
      }

      const result = await this.calculateProductCbm(term, product)
      await this.cacheManager.set(cacheKey, result, 7 * 24 * 60 * 60 * 1000)

      return { success: true, data: result }
    } catch (error) {
      this.logger.warn(`Erro ao calcular CBM individual para "${term}": ${error.message}`)
      return {
        success: false,
        data: this.createEmptyCbmResponse(term),
        message: error.message,
      }
    }
  }

  private async calculateProductCbm(term: string, product?: any): Promise<any> {
    const dataFromProduct = product ? this.extractVolumeAndWeightFromProduct(product) : null

    if (dataFromProduct?.found_in_product && dataFromProduct?.extraction_status === 'complete') {
      return {
        search_term: term,
        dimensions: {
          CBM: { DisplayValue: dataFromProduct.volume_m3 },
          Weight: { DisplayValue: dataFromProduct.weight_kg },
        },
        source: 'product_object_complete',
        volume_cm3: dataFromProduct.volume_cm3,
        weight_kg: dataFromProduct.weight_kg,
        has_volume: dataFromProduct.has_volume,
        has_weight: dataFromProduct.has_weight,
      }
    }

    const externalData = await this.getVolumeAndWeightFromExternalEndpoint(term, product?.description || '')

    if (externalData.external_success) {
      if (dataFromProduct?.found_in_product) {
        const finalVolume = dataFromProduct.has_volume ? dataFromProduct.volume_cm3 : externalData.volume_cm3
        const finalWeight = dataFromProduct.has_weight ? dataFromProduct.weight_kg : externalData.weight_kg
        const finalVolumeM3 = finalVolume ? finalVolume / 1000000 : null

        return {
          search_term: term,
          dimensions: {
            CBM: { DisplayValue: finalVolumeM3 },
            Weight: { DisplayValue: finalWeight },
          },
          source: 'hybrid_product_external',
          volume_cm3: finalVolume,
          weight_kg: finalWeight,
          has_volume: finalVolume !== null,
          has_weight: finalWeight !== null,
          hybrid_details: {
            volume_from: dataFromProduct.has_volume ? 'product' : 'external',
            weight_from: dataFromProduct.has_weight ? 'product' : 'external',
          },
        }
      }

      return {
        search_term: term,
        dimensions: {
          CBM: { DisplayValue: externalData.volume_m3 },
          Weight: { DisplayValue: externalData.weight_kg },
        },
        source: 'external_endpoint',
        method: externalData.method,
        inferred: externalData.inferred,
        volume_cm3: externalData.volume_cm3,
        weight_kg: externalData.weight_kg,
        has_volume: externalData.has_volume,
        has_weight: externalData.has_weight,
      }
    }

    if (dataFromProduct?.found_in_product) {
      return {
        search_term: term,
        dimensions: {
          CBM: { DisplayValue: dataFromProduct.volume_m3 },
          Weight: { DisplayValue: dataFromProduct.weight_kg },
        },
        source: 'product_object_partial',
        volume_cm3: dataFromProduct.volume_cm3,
        weight_kg: dataFromProduct.weight_kg,
        has_volume: dataFromProduct.has_volume,
        has_weight: dataFromProduct.has_weight,
      }
    }

    return this.createEmptyCbmResponse(term)
  }

  private extractVolumeAndWeightFromProduct(product: any): any {
    if (!product || typeof product !== 'object') {
      return {
        found_in_product: false,
        extraction_status: 'none',
        has_volume: false,
        has_weight: false,
        volume_cm3: null,
        volume_m3: null,
        weight_kg: null,
        needs_volume_from_external: true,
        needs_weight_from_external: true,
      }
    }

    let volume_cm3: number | null = null
    let weight_kg: number | null = null

    const skus = product.skus || []
    for (const sku of skus) {
      if (sku.volume && !volume_cm3) {
        volume_cm3 = parseFloat(sku.volume)
      }
      if (sku.weight && !weight_kg) {
        weight_kg = parseFloat(sku.weight) / 1000
      }
    }

    if (product.product_props) {
      const props = Array.isArray(product.product_props) ? product.product_props : []
      for (const prop of props) {
        const propName = String(prop.name || '').toLowerCase()
        const propValue = String(prop.value || '')

        if (!volume_cm3 && (propName.includes('volume') || propName.includes('尺寸') || propName.includes('size'))) {
          const dims = this.parseDimensions(propValue)
          if (dims) {
            volume_cm3 = dims.length * dims.width * dims.height
          }
        }

        if (!weight_kg && (propName.includes('weight') || propName.includes('重量'))) {
          const match = propValue.match(/[\d.]+/)
          if (match) {
            let w = parseFloat(match[0])
            if (propValue.toLowerCase().includes('g') && !propValue.toLowerCase().includes('kg')) {
              w = w / 1000
            }
            weight_kg = w
          }
        }
      }
    }

    const has_volume = volume_cm3 !== null && volume_cm3 > 0
    const has_weight = weight_kg !== null && weight_kg > 0
    const found_in_product = has_volume || has_weight

    let extraction_status = 'none'
    if (has_volume && has_weight) {
      extraction_status = 'complete'
    } else if (found_in_product) {
      extraction_status = 'partial'
    }

    return {
      found_in_product,
      extraction_status,
      has_volume,
      has_weight,
      volume_cm3,
      volume_m3: volume_cm3 ? volume_cm3 / 1000000 : null,
      weight_kg,
      needs_volume_from_external: !has_volume,
      needs_weight_from_external: !has_weight,
    }
  }

  private parseDimensions(value: string): { length: number; width: number; height: number } | null {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*cm\s*[x×*]\s*(\d+(?:\.\d+)?)\s*cm\s*[x×*]\s*(\d+(?:\.\d+)?)\s*cm/i,
    ]

    for (const pattern of patterns) {
      const match = value.match(pattern)
      if (match) {
        return {
          length: parseFloat(match[1]),
          width: parseFloat(match[2]),
          height: parseFloat(match[3]),
        }
      }
    }

    return null
  }

  private async getVolumeAndWeightFromExternalEndpoint(
    productTitle: string,
    productDescription: string,
  ): Promise<any> {
    try {
      const response = await fetch('https://amazon-scraper.chinafacil.com/api/batch', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 76c5c607-da44-4885-a450-02fc80d17d6e',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ terms: [productTitle] }),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        this.logger.warn(`Amazon scraper returned ${response.status}`)
        return { external_success: false }
      }

      const data = await response.json()
      const result = data?.results?.[0]

      if (!result) {
        return { external_success: false }
      }

      const cbm = result.dimensions?.CBM?.DisplayValue
      const weight = result.dimensions?.Weight?.DisplayValue

      return {
        external_success: cbm !== null || weight !== null,
        volume_cm3: cbm ? cbm * 1000000 : null,
        volume_m3: cbm || null,
        weight_kg: weight || null,
        has_volume: cbm !== null,
        has_weight: weight !== null,
        method: 'amazon_scraper',
        inferred: result.inferred || false,
      }
    } catch (error) {
      this.logger.warn(`External endpoint error: ${error.message}`)
      return { external_success: false }
    }
  }

  private createEmptyCbmResponse(term: string): any {
    return {
      search_term: term,
      dimensions: {
        CBM: { DisplayValue: null },
        Weight: { DisplayValue: null },
      },
      source: 'none',
      volume_cm3: null,
      weight_kg: null,
      has_volume: false,
      has_weight: false,
    }
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }
}


