import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../../common/decorators/roles.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { AddStatusDto } from '../dto/add-status.dto'
import { SolicitationTrackingService } from '../services/solicitation-tracking.service'
import { PrismaService } from '../../../database/prisma.service'

@ApiTags('solicitation-tracking')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitationTrackingController {
  constructor(
    private readonly trackingService: SolicitationTrackingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status-trecking/:id')
  @Roles('admin', 'user', 'seller', 'lead', 'sourcer')
  @ApiOperation({ summary: 'Obter status de rastreamento da solicitação' })
  @ApiResponse({
    status: 200,
    description: 'Status de rastreamento',
    schema: {
      example: {
        steps: {
          step1: {
            order_received: 'Pedido recebido',
            analyzing_costs_logistics: 'Analisando custos e logística',
          },
        },
        avaliable_steps: {
          'step2:order_confirmed': 4,
        },
        steps_values: {
          'step1:order_received': 0,
        },
      },
    },
  })
  async getTrackingStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    if (userRole !== 'admin' && userRole !== 'seller') {
      const solicitation = await this.prisma.solicitation.findUnique({
        where: { id },
        select: { userId: true },
      })
      
      if (!solicitation || solicitation.userId !== userId) {
        throw new ForbiddenException('Você não tem permissão para acessar esta solicitação')
      }
    }
    
    return this.trackingService.getTrackingStatus(id)
  }

  @Get('trecking/solicitation/:id')
  @Roles('admin', 'user', 'seller', 'lead', 'sourcer')
  @ApiOperation({ summary: 'Obter histórico de status da solicitação' })
  @ApiResponse({
    status: 200,
    description: 'Histórico de status',
  })
  async getStatusSolicitation(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    if (userRole !== 'admin' && userRole !== 'seller') {
      const solicitation = await this.prisma.solicitation.findUnique({
        where: { id },
        select: { userId: true },
      })
      
      if (!solicitation || solicitation.userId !== userId) {
        throw new ForbiddenException('Você não tem permissão para acessar esta solicitação')
      }
    }
    
    const data = await this.trackingService.getStatusSolicitation(id)
    return { data }
  }

  @Post('trecking/solicitation/:id')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Adicionar novo status à solicitação' })
  @ApiResponse({
    status: 201,
    description: 'Status adicionado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível retornar a uma etapa anterior',
  })
  async addStatusSolicitation(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
    @Body() body: AddStatusDto
  ) {
    const userId = req.user?.id
    const timeDate = body.time_date ? new Date(body.time_date) : undefined

    const data = await this.trackingService.addStatusSolicitation(id, userId, body.status, timeDate)
    return { data }
  }
}

