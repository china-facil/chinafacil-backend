import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
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
import { GenericWebhookDto, TypeformWebhookDto } from './dto'
import { WebhooksService } from './webhooks.service'

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('typeform')
  @ApiOperation({ summary: 'Receber webhook do Typeform' })
  @ApiResponse({ status: 201, description: 'Webhook processado' })
  async handleTypeform(@Body() typeformWebhookDto: TypeformWebhookDto) {
    return this.webhooksService.handleTypeformWebhook(typeformWebhookDto)
  }

  @Post('generic')
  @ApiOperation({ summary: 'Receber webhook genérico' })
  @ApiResponse({ status: 201, description: 'Webhook processado' })
  async handleGeneric(@Body() genericWebhookDto: GenericWebhookDto) {
    return this.webhooksService.handleGenericWebhook(genericWebhookDto)
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obter logs de webhooks' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Logs de webhooks' })
  async getWebhookLogs(@Query('limit') limit?: number) {
    return this.webhooksService.getWebhookLogs(
      limit ? Number(limit) : undefined,
    )
  }
}

