import { Controller, Get, Query, UseGuards } from '@nestjs/common'
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
import { StatisticsService } from './statistics.service'

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('total-clients-by-plan')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Total de clientes por plano' })
  @ApiResponse({ status: 200, description: 'Estatísticas por plano' })
  async getTotalClientsByPlan() {
    return this.statisticsService.getTotalClientsByPlan()
  }

  @Get('monthly-metrics')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Métricas mensais' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Métricas do mês' })
  async getMonthlyMetrics(
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.statisticsService.getMonthlyMetrics(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    )
  }

  @Get('admin-dashboard')
  @Roles('admin')
  @ApiOperation({ summary: 'Estatísticas do dashboard admin' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getAdminDashboard() {
    return this.statisticsService.getAdminDashboardStatistics()
  }

  @Get('solicitations-by-status')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Solicitações agrupadas por status' })
  @ApiResponse({ status: 200, description: 'Contagem por status' })
  async getSolicitationsByStatus() {
    return this.statisticsService.getSolicitationsByStatus()
  }

  @Get('user-growth')
  @Roles('admin')
  @ApiOperation({ summary: 'Crescimento de usuários' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Crescimento mensal' })
  async getUserGrowth(@Query('months') months?: number) {
    return this.statisticsService.getUserGrowth(
      months ? Number(months) : undefined,
    )
  }
}


