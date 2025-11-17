import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import { AIService } from '../../ai/ai.service'

@Injectable()
export class NcmService {
  private readonly logger = new Logger(NcmService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findByCode(ncmCode: string) {
    const cleanCode = ncmCode.trim()

    const cacheKey = `ncm:code:${cleanCode}`
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return { ...cached, cached: true }
    }

    const ncm = await this.prisma.ncm.findUnique({
      where: { code: cleanCode },
    })

    if (!ncm) {
      throw new NotFoundException(`Código NCM não encontrado: ${ncmCode}`)
    }

    await this.cacheManager.set(cacheKey, ncm, 604800000)

    return ncm
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
      } catch (error) {
        this.logger.warn(`Tentativa ${attempts + 1} falhou: ${error.message}`)
      }

      attempts++
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!aiResponse?.number) {
      throw new Error('Não foi possível identificar o código NCM')
    }

    const ncm = await this.prisma.ncm.findUnique({
      where: { code: aiResponse.number },
    })

    if (!ncm) {
      throw new NotFoundException(
        `Código NCM não encontrado no banco: ${aiResponse.number}`,
      )
    }

    const result = {
      ...ncm,
      text: aiResponse.text,
      number: aiResponse.number,
    }

    await this.cacheManager.set(cacheKey, result, 604800000)

    return result
  }
}

