import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthService } from './health.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-11-12T14:30:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        database: { type: 'string', example: 'connected' },
        redis: { type: 'string', example: 'connected' },
      },
    },
  })
  async check() {
    return this.healthService.check()
  }
}

