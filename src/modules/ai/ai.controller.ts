import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AIService } from './ai.service'
import {
  ChatCompletionDto,
  CompletionDto,
  ProductSimilarityDto,
} from './dto'

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('completion')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gerar completion (OpenAI)' })
  @ApiResponse({ status: 201, description: 'Completion gerado' })
  async completion(@Body() completionDto: CompletionDto) {
    return this.aiService.completion(completionDto)
  }

  @Post('chat')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Chat completion' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Resposta gerada' })
  async chatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    return this.aiService.chatCompletion(chatCompletionDto, provider)
  }

  @Post('embedding')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gerar embedding (OpenAI)' })
  @ApiResponse({ status: 201, description: 'Embedding gerado' })
  async generateEmbedding(@Body('text') text: string) {
    return this.aiService.generateEmbedding(text)
  }

  @Post('product-similarity')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Analisar similaridade entre produtos' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Análise concluída' })
  async analyzeProductSimilarity(
    @Body() productSimilarityDto: ProductSimilarityDto,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    return this.aiService.analyzeProductSimilarity(
      productSimilarityDto,
      provider,
    )
  }
}


