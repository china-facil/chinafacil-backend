import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { extname } from 'path'
import { Throttle } from '@nestjs/throttler'
import { Response } from 'express'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AIService } from './ai.service'
import {
  ChatCompletionDto,
  CompletionDto,
  EmbeddingDto,
  ProductSimilarityDto,
  DetectIntentDto,
  ConciergeAskDto,
} from './dto'

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('completion')
  @Roles('admin')
  @ApiOperation({ summary: 'Gerar completion (OpenAI)' })
  @ApiResponse({ status: 201, description: 'Completion gerado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async completion(@Body() completionDto: CompletionDto) {
    return this.aiService.completion(completionDto)
  }

  @Post('chat')
  @Roles('admin')
  @ApiOperation({ summary: 'Chat completion' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Resposta gerada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
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
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
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
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async generateEmbedding(@Body() embeddingDto: EmbeddingDto) {
    return this.aiService.generateEmbedding(embeddingDto.text)
  }

  @Post('product-similarity')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Analisar similaridade entre produtos' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Análise concluída' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async analyzeProductSimilarity(
    @Body() productSimilarityDto: ProductSimilarityDto,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    return this.aiService.analyzeProductSimilarity(
      productSimilarityDto,
      provider,
    )
  }

  @Post('concierge/detect-intent')
  @Roles('admin', 'seller', 'user', 'client')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Detectar intenção do usuário no concierge (com suporte a imagem)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensagem do usuário para detectar intenção',
          example: 'busque carregadores',
        },
        conversation_history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              content: { type: 'string' },
            },
          },
          description: 'Histórico da conversa',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do produto (opcional)',
        },
      },
      required: ['message'],
    },
  })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ 
    status: 201, 
    description: 'Intenção detectada',
    schema: {
      example: {
        status: 'success',
        data: {
          intent: 'product_search',
          message: 'busque carregadores',
          imgUrl: 'http://localhost:3000/uploads/search-images/abc123def456.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads/search-images'
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(null, true)
        }
        if (!file.originalname || !file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new BadRequestException('Apenas imagens são permitidas (JPG, JPEG, PNG, GIF ou WEBP)'), false)
        }
        cb(null, true)
      },
    }),
  )
  async detectIntent(
    @Body() detectIntentDto: DetectIntentDto,
    @CurrentUser() user: any,
    @UploadedFile() image?: Express.Multer.File,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    const userId = user?.id || null
    return this.aiService.detectIntent(detectIntentDto, userId, provider, image)
  }

  @Post('concierge/ask')
  @Roles('admin', 'seller', 'user', 'client')
  @ApiOperation({ summary: 'Fazer pergunta ao concierge' })
  @ApiQuery({ name: 'provider', required: false, enum: ['openai', 'anthropic'] })
  @ApiResponse({ status: 201, description: 'Resposta gerada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async askConcierge(
    @Body() conciergeAskDto: ConciergeAskDto,
    @CurrentUser() user: any,
    @Query('provider') provider?: 'openai' | 'anthropic',
  ) {
    const userId = user?.id || null
    return this.aiService.askConcierge(conciergeAskDto, userId, provider)
  }

  @Get('concierge/history')
  @Roles('admin', 'seller', 'user', 'client')
  @ApiOperation({ summary: 'Buscar histórico de interações do concierge' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de interações (padrão: 50)' })
  @ApiResponse({ status: 200, description: 'Histórico de interações' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async getConciergeHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const userId = user?.id
    if (!userId) {
      return {
        status: 'error',
        data: [],
      }
    }

    const limitNumber = limit ? parseInt(limit, 10) : 50
    return this.aiService.getConciergeHistory(userId, limitNumber)
  }
}
