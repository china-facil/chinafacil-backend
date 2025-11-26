import { Injectable } from '@nestjs/common'
import { AnthropicService } from '../../integrations/ai-providers/anthropic/anthropic.service'
import { OpenAIService } from '../../integrations/ai-providers/openai/openai.service'
import {
  ChatCompletionDto,
  CompletionDto,
  ProductSimilarityDto,
} from './dto'

@Injectable()
export class AIService {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly anthropicService: AnthropicService,
  ) {}

  async completion(completionDto: CompletionDto) {
    return this.openaiService.completion(completionDto)
  }

  async chatCompletion(
    chatCompletionDto: ChatCompletionDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    if (provider === 'anthropic') {
      return this.anthropicService.chatCompletion(chatCompletionDto)
    }
    return this.openaiService.chatCompletion(chatCompletionDto)
  }

  async chatCompletionStream(chatCompletionDto: ChatCompletionDto) {
    return this.openaiService.chatCompletionStream(chatCompletionDto)
  }

  async generateEmbedding(text: string) {
    return this.openaiService.generateEmbedding(text)
  }

  async completionsImage(body: any) {
    return this.openaiService.completionsImage(body)
  }

  async analyzeProductSimilarity(
    productSimilarityDto: ProductSimilarityDto,
    provider: 'openai' | 'anthropic' = 'openai',
  ) {
    if (provider === 'anthropic') {
      return this.anthropicService.analyzeProductSimilarity(
        productSimilarityDto.mercadoLivreProduct,
        productSimilarityDto.chinaProduct,
      )
    }
    return this.openaiService.analyzeProductSimilarity(
      productSimilarityDto.mercadoLivreProduct,
      productSimilarityDto.chinaProduct,
    )
  }
}


