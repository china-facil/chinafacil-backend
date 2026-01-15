import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { NcmDatabaseService } from '../../../database/ncm-database.service'
import { AIService } from '../../ai/ai.service'

@Injectable()
export class NcmService {
  private readonly logger = new Logger(NcmService.name)

  constructor(
    private readonly ncmDatabase: NcmDatabaseService,
    private readonly aiService: AIService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findByCode(ncmCode: string) {
    if (!ncmCode || !ncmCode.trim()) {
      throw new NotFoundException('Código NCM não fornecido')
    }

    const cleanCode = ncmCode.trim().replace(/[^0-9]/g, '')

    if (!this.isValidNcmCode(cleanCode)) {
      throw new NotFoundException(`Código NCM inválido: ${ncmCode}`)
    }

    const cacheKey = `ncm:code:${cleanCode}`
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return { ...cached, cached: true }
    }

    try {
      const ncm = await this.ncmDatabase.findByCode(cleanCode)

      if (!ncm) {
        throw new NotFoundException(`Código NCM não encontrado: ${ncmCode}`)
      }

      const result = {
        codigo: ncm.codigo,
        nome: ncm.nome,
        ii: ncm.ii,
        ipi: ncm.ipi,
        pis: ncm.pis,
        cofins: ncm.cofins,
      }

      await this.cacheManager.set(cacheKey, result, 604800000)

      return result
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error(`Erro ao buscar NCM: ${error.message}`)
      throw new NotFoundException(`Código NCM não encontrado: ${ncmCode}`)
    }
  }

  async findSimilarByPrefix(ncmCode: string) {
    if (!ncmCode || !ncmCode.trim()) {
      throw new NotFoundException('Código NCM não fornecido')
    }

    const cleanCode = ncmCode.trim().replace(/[^0-9]/g, '')

    if (cleanCode.length < 6) {
      throw new NotFoundException('Código NCM deve ter ao menos 6 dígitos para busca similar')
    }

    const prefix = cleanCode.substring(0, 6)
    const cacheKey = `ncm:similar:${prefix}`
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return { ...cached, cached: true }
    }

    try {
      const ncmList = await this.ncmDatabase.findByCodeLike(prefix)

      if (!ncmList || ncmList.length === 0) {
        throw new NotFoundException(`Nenhum NCM similar encontrado para prefixo: ${prefix}`)
      }

      const firstMatch = ncmList[0]
      const result = {
        codigo: firstMatch.codigo,
        nome: firstMatch.nome,
        ii: firstMatch.ii,
        ipi: firstMatch.ipi,
        pis: firstMatch.pis,
        cofins: firstMatch.cofins,
        isSimilar: true,
        originalCode: ncmCode,
      }

      await this.cacheManager.set(cacheKey, result, 604800000)

      return result
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error(`Erro ao buscar NCM similar: ${error.message}`)
      throw new NotFoundException(`Nenhum NCM similar encontrado para: ${ncmCode}`)
    }
  }

  private normalizeNcmCode(code: string): string {
    return code.replace(/[^0-9]/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
  }

  private isValidNcmCode(code: string): boolean {
    const cleanCode = code.replace(/[^0-9]/g, '')
    return cleanCode.length === 8 && /^\d{8}$/.test(cleanCode)
  }

  async findByCodeLike(ncmCode: string) {
    const cleanCode = ncmCode.trim().replace(/[^0-9]/g, '')
    return await this.ncmDatabase.findByCodeLike(cleanCode)
  }

  async findByDescription(product: any) {
    const productId = product?.id || product?.name || 'unknown'
    const productName = product?.name || productId

    const cacheKey = `ncm:desc:${productId}`
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return { ...cached, cached: true }
    }

    const productInfo = {
      name: product?.name || product?.title || '',
      description: product?.description || '',
      category: product?.category || product?.category_name || '',
      provider: product?.provider || '',
    }

    const truncatedName = productInfo.name.length > 500 ? productInfo.name.substring(0, 500) + '...' : productInfo.name
    const truncatedDescription = productInfo.description.length > 300 ? productInfo.description.substring(0, 300) + '...' : productInfo.description

    const productSummary = {
      name: truncatedName,
      description: truncatedDescription,
      category: productInfo.category,
      provider: productInfo.provider,
    }

    const systemPrompt = `Você é um especialista em classificação fiscal brasileira. Identifique o código NCM (8 dígitos com pontos) e certificações obrigatórias. Retorne apenas JSON: {"text": "ÓRGÃO1,ÓRGÃO2" ou "N/A", "number": "1234.56.78"}`

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: `Classifique este produto: ${JSON.stringify(productSummary)}`,
      },
    ]

    try {
      const response = await this.aiService.chatCompletion({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0,
        maxTokens: 50,
      })

      if (response?.message?.content) {
        const content = response.message.content
        const cleaned = content.replace(/```json|```|\s/g, '').replace(/`/g, '')
        const aiResponse = JSON.parse(cleaned)

        if (!aiResponse?.number) {
          throw new Error('Não foi possível identificar o código NCM')
        }

        const cleanCode = aiResponse.number.replace(/[^0-9]/g, '')
        
        try {
          const ncm = await this.ncmDatabase.findByCode(cleanCode)

          if (!ncm) {
            throw new NotFoundException(
              `Código NCM não encontrado no banco: ${aiResponse.number}`,
            )
          }

          const result = {
            codigo: ncm.codigo,
            nome: ncm.nome,
            ii: ncm.ii,
            ipi: ncm.ipi,
            pis: ncm.pis,
            cofins: ncm.cofins,
            text: aiResponse.text,
            number: aiResponse.number,
          }

          await this.cacheManager.set(cacheKey, result, 604800000)

          return result
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error
          }
          this.logger.error(`Erro ao buscar NCM: ${error.message}`)
          throw new NotFoundException(
            `Código NCM não encontrado no banco: ${aiResponse.number}`,
          )
        }
      } else {
        throw new Error('Resposta da OpenAI não contém conteúdo')
      }
    } catch (error: any) {
      if (error.message?.includes('not initialized') || error.message?.includes('API key') || error.message?.includes('não configurado')) {
        throw new Error('OpenAI service não configurado. OPEN_AI_API_KEY é obrigatório.')
      }
      
      throw error
    }
  }
}

