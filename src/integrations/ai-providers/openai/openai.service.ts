import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { ChatCompletionDto, CompletionDto } from '../../../modules/ai/dto'

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name)
  private openai: OpenAI

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY')
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      })
    }
  }

  async completion(completionDto: CompletionDto) {
    try {
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
    } catch (error) {
      this.logger.error(`OpenAI completion error: ${error.message}`)
      throw error
    }
  }

  async chatCompletion(chatCompletionDto: ChatCompletionDto) {
    try {
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
    } catch (error) {
      this.logger.error(`OpenAI chat completion error: ${error.message}`)
      throw error
    }
  }

  async generateEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      })

      return response.data[0].embedding
    } catch (error) {
      this.logger.error(`OpenAI embedding error: ${error.message}`)
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


