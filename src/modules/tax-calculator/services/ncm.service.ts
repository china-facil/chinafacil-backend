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

    const systemPrompt = `Você é um especialista em classificação fiscal brasileira. Identifique o código NCM (8 dígitos com pontos) e certificações obrigatórias. Retorne apenas JSON: {"text": "ÓRGÃO1,ÓRGÃO2" ou "N/A", "number": "1234.56.78"}`

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: `Classifique este produto: ${JSON.stringify(product)}`,
      },
    ]

    let attempts = 0
    const maxAttempts = 3
    let aiResponse: any = null

    let openAiError: Error | null = null

    while (attempts < maxAttempts) {
      try {
        const response = await this.aiService.chatCompletion({
          model: 'gpt-4o',
          messages,
          temperature: 0,
          maxTokens: 50,
        })

        if (response?.message?.content) {
          const content = response.message.content
          const cleaned = content.replace(/```json|```|\s/g, '').replace(/`/g, '')
          aiResponse = JSON.parse(cleaned)
          break
        }
      } catch (error: any) {
        this.logger.warn(`Tentativa ${attempts + 1} falhou: ${error.message}`)
        if (error.message?.includes('not initialized') || error.message?.includes('API key') || error.message?.includes('não configurado')) {
          openAiError = new Error('OpenAI service não configurado. OPENAI_API_KEY é obrigatório.')
          break
        }
      }

      attempts++
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (openAiError) {
      this.logger.error(openAiError.message)
      throw openAiError
    }

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
  }
}

