import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const timestamp = new Date().toISOString()
    const uptime = process.uptime()

    let databaseStatus = 'disconnected'
    try {
      await this.prisma.$queryRaw`SELECT 1`
      databaseStatus = 'connected'
    } catch (error) {
      this.logger.error('Database health check failed:', error.message)
    }

    const redisStatus = 'not-checked'

    return {
      status: 'success',
      timestamp,
      uptime,
      database: databaseStatus,
      redis: redisStatus,
    }
  }
}

