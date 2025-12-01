import {
  Body,
  Controller,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
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
  @Roles('admin')
  @ApiOperation({ summary: 'Gerar completion (OpenAI)' })
  @ApiResponse({ status: 201, description: 'Completion gerado' })
  async completion(@Body() completionDto: CompletionDto) {
    return this.aiService.completion(completionDto)
  }

  @Post('chat')
  @Roles('admin')
  @ApiOperation({ summary: 'Chat completion' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Resposta gerada' })
  async chatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    return this.aiService.chatCompletion(chatCompletionDto, provider)
  }

  @Post('chat/stream')
  @Roles('admin')
  @ApiOperation({ summary: 'Chat completion com streaming (SSE)' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 200, description: 'Stream de respostas' })
  async chatCompletionStream(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Query('provider') provider: 'openai' | 'anthropic' = 'openai',
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      if (provider === 'openai') {
        const stream = await this.aiService.chatCompletionStream(
          chatCompletionDto,
        )

        for await (const chunk of stream) {
          const data = chunk.choices?.[0]?.delta?.content || ''
          if (data) {
            res.write(`data: ${JSON.stringify({ content: data })}\n\n`)
          }
        }
      } else {
        const result = await this.aiService.chatCompletion(
          chatCompletionDto,
          provider,
        )
        const content = result.message?.content || ''
        res.write(`data: ${JSON.stringify({ content })}\n\n`)
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ error: error.message })}\n\n`,
      )
      res.end()
    }
  }

  @Post('embedding')
  @Roles('admin')
  @ApiOperation({ summary: 'Gerar embedding (OpenAI)' })
  @ApiResponse({ status: 201, description: 'Embedding gerado' })
  async generateEmbedding(@Body('text') text: string) {
    return this.aiService.generateEmbedding(text)
  }

  @Post('product-similarity')
  @Roles('admin', 'seller')
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


