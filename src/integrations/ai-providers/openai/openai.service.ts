import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { ChatCompletionDto, CompletionDto } from '../../../modules/ai/dto'

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name)
  private openai: OpenAI
  private readonly maxAttempts = 3

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('OPEN_AI_API_KEY')
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        timeout: 10000,
      })
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxAttempts: number = this.maxAttempts,
  ): Promise<T> {
    let attempts = 0

    while (attempts < maxAttempts) {
      const attemptStart = Date.now()
      try {
        return await operation()
      } catch (error: any) {
        attempts++
        const duration = (Date.now() - attemptStart) / 1000
        const statusCode = error?.status || error?.response?.status

        const hasChoices = error?.response?.data?.choices && error.response.data.choices.length > 0
        if (hasChoices) {
          return error.response.data as T
        }

        const isDefinitiveError = statusCode >= 400 && statusCode < 500 && statusCode !== 429
        if (isDefinitiveError || attempts >= maxAttempts) {
          throw error
        }

        const isRateLimit = statusCode === 429
        const isServerError = statusCode >= 500
        const isTimeout = error.message?.includes('timeout') || error.code === 'ECONNABORTED' || duration >= 9

        if (isTimeout && attempts < maxAttempts) {
          await this.sleep(200)
        } else if (isRateLimit || isServerError) {
          const delay = isRateLimit ? 2000 : 1000
          await this.sleep(delay)
        } else {
          await this.sleep(500)
        }
      }
    }

    throw new Error(`${operationName} failed after ${maxAttempts} attempts`)
  }

  private ensureInitialized() {
    if (!this.openai) {
      throw new Error('OpenAI service not initialized. OPEN_AI_API_KEY is required.')
    }
  }

  async completion(completionDto: CompletionDto) {
    this.ensureInitialized()
    return this.retryWithBackoff(async () => {
      const response = await this.openai.completions.create({
        model: completionDto.model || 'gpt-3.5-turbo-instruct',
        prompt: completionDto.prompt,
        temperature: completionDto.temperature || 0.7,
        max_tokens: completionDto.maxTokens || 1000,
      })

      return {
        text: response.choices[0].text,
        usage: response.usage,
      }
    }, 'OpenAI completion')
  }

  async chatCompletion(chatCompletionDto: ChatCompletionDto) {
    this.ensureInitialized()
    return this.retryWithBackoff(async () => {
      const response = await this.openai.chat.completions.create({
        model: chatCompletionDto.model || 'gpt-4',
        messages: chatCompletionDto.messages as any,
        temperature: chatCompletionDto.temperature || 0.7,
        max_tokens: chatCompletionDto.maxTokens || 1000,
      })

      return {
        message: response.choices[0].message,
        usage: response.usage,
      }
    }, 'OpenAI chat completion')
  }

  async completionsImage(body: any) {
    this.ensureInitialized()
    let response: any = null

    do {
      try {
        response = await this.openai.chat.completions.create({
          model: body.model || 'gpt-4',
          messages: body.messages || [],
          temperature: body.temperature || 0.7,
          max_tokens: body.max_tokens || 1000,
        })

        if (response.choices && response.choices.length > 0) {
          break
        }

        this.logger.warn('OpenAI completions image: No choices in response, retrying...')
        await this.sleep(10000)
      } catch (error: any) {
        this.logger.error(`OpenAI completions image error: ${error.message}`)
        await this.sleep(10000)
      }
    } while (!response?.choices || response.choices.length === 0)

    return response
  }

  async chatCompletionStream(chatCompletionDto: ChatCompletionDto) {
    this.ensureInitialized()
    try {
      const stream = await this.openai.chat.completions.create({
        model: chatCompletionDto.model || 'gpt-4',
        messages: chatCompletionDto.messages as any,
        temperature: chatCompletionDto.temperature || 0.7,
        max_tokens: chatCompletionDto.maxTokens || 1000,
        stream: true,
      })

      return stream
    } catch (error) {
      this.logger.error(`OpenAI chat completion stream error: ${error.message}`)
      throw error
    }
  }

  async generateEmbedding(text: string) {
    this.ensureInitialized()
    return this.retryWithBackoff(async () => {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      })

      return response.data[0].embedding
    }, 'OpenAI embedding')
  }

  async analyzeProductSimilarity(
    mercadoLivreProduct: any,
    chinaProduct: any,
  ) {
    const prompt = `
Analise a similaridade entre estes dois produtos:

Produto Mercado Livre:
Título: ${mercadoLivreProduct.title || 'N/A'}
Descrição: ${mercadoLivreProduct.description || 'N/A'}

Produto China:
Título: ${chinaProduct.title || 'N/A'}
Descrição: ${chinaProduct.description || 'N/A'}

Responda APENAS com um JSON no seguinte formato:
{
  "similarity_score": 0-100,
  "is_similar": true/false,
  "confidence": 0-100,
  "reasons": ["razão 1", "razão 2", ...],
  "differences": ["diferença 1", "diferença 2", ...]
}
`

    try {
      const response = await this.chatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em análise de produtos e comparação de similares.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      })

      const content = response.message.content
      if (!content) {
        return {
          similarity_score: 0,
          is_similar: false,
          confidence: 0,
          reasons: [],
          differences: ['Resposta da IA vazia'],
        }
      }
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        similarity_score: 0,
        is_similar: false,
        confidence: 0,
        reasons: [],
        differences: ['Erro ao analisar resposta da IA'],
      }
    } catch (error) {
      this.logger.error(`Product similarity analysis error: ${error.message}`)
      throw error
    }
  }
}


