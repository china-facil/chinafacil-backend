import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { ChatCompletionDto } from '../../../modules/ai/dto'

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name)
  private anthropic: Anthropic

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('ANTHROPIC_API_KEY')
    
    if (apiKey) {
      this.anthropic = new Anthropic({
        apiKey,
      })
    }
  }

  async chatCompletion(chatCompletionDto: ChatCompletionDto) {
    try {
      const systemMessage = chatCompletionDto.messages.find(
        (m) => m.role === 'system',
      )
      const userMessages = chatCompletionDto.messages.filter(
        (m) => m.role !== 'system',
      )

      const response = await this.anthropic.messages.create({
        model: chatCompletionDto.model || 'claude-3-sonnet-20240229',
        max_tokens: chatCompletionDto.maxTokens || 1000,
        system: systemMessage?.content || '',
        messages: userMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      return {
        message: {
          role: 'assistant',
          content: response.content[0].type === 'text' ? response.content[0].text : '',
        },
        usage: response.usage,
      }
    } catch (error) {
      this.logger.error(`Anthropic chat completion error: ${error.message}`)
      throw error
    }
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

