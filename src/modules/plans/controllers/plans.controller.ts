import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../../../common/decorators/public.decorator'
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { CreatePlanDto, UpdatePlanDto } from '../dto'
import { PlansService } from '../services/plans.service'

@ApiTags('plans')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('plans')
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo plano' })
  @ApiResponse({
    status: 201,
    description: 'Plano criado com sucesso',
    schema: {
      example: {
        id: 'plan-uuid',
        name: 'Plano Premium',
        price: 99.90,
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto)
  }

  @Get('plans')
  @Roles('admin', 'seller', 'user')
  @ApiOperation({ summary: 'Listar todos os planos' })
  @ApiResponse({ status: 200, description: 'Lista de planos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll() {
    return this.plansService.findClients()
  }

  @Get('plans/active')
  @Public()
  @ApiOperation({ summary: 'Listar planos ativos' })
  @ApiResponse({ status: 200, description: 'Lista de planos ativos' })
  async findActive() {
    return this.plansService.findActive()
  }

  @Get('plans-active')
  @Public()
  @ApiOperation({ summary: 'Listar planos ativos (alias para compatibilidade)' })
  @ApiResponse({ status: 200, description: 'Lista de planos ativos' })
  async findActivePlans() {
    return this.plansService.findActiveClients()
  }

  @Get('plans/:id')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter detalhes de um plano' })
  @ApiResponse({ status: 200, description: 'Detalhes do plano' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id)
  }

  @Patch('plans/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar plano' })
  @ApiResponse({ status: 200, description: 'Plano atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, updatePlanDto)
  }

  @Delete('plans/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover plano' })
  @ApiResponse({
    status: 200,
    description: 'Plano removido ou desativado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async remove(@Param('id') id: string) {
    return this.plansService.remove(id)
  }
}


