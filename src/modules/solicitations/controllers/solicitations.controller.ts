import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import {
  AssignResponsibilityDto,
  CreateSolicitationDto,
  FilterSolicitationDto,
  UpdateSolicitationDto,
} from '../dto'
import { SolicitationsService } from '../services/solicitations.service'

@ApiTags('solicitations')
@Controller('solicitations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitationsController {
  constructor(private readonly solicitationsService: SolicitationsService) {}

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Criar nova solicitação' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  async create(@Body() createSolicitationDto: CreateSolicitationDto) {
    return this.solicitationsService.create(createSolicitationDto)
  }

  @Get()
  @Roles('admin', 'seller', 'user')
  @ApiOperation({ summary: 'Listar solicitações com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações' })
  async findAll(@Query() filterDto: FilterSolicitationDto) {
    return this.solicitationsService.findAll(filterDto)
  }

  @Get('statistics')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter estatísticas de solicitações' })
  @ApiResponse({ status: 200, description: 'Estatísticas' })
  async getStatistics() {
    return this.solicitationsService.getStatistics()
  }

  @Get('kanban')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter solicitações em formato kanban' })
  @ApiResponse({ status: 200, description: 'Kanban board' })
  async getKanban() {
    return this.solicitationsService.getKanban()
  }

  @Get(':id')
  @Roles('admin', 'seller', 'user')
  @ApiOperation({ summary: 'Obter detalhes de uma solicitação' })
  @ApiResponse({ status: 200, description: 'Detalhes da solicitação' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.solicitationsService.findOne(id)
  }

  @Patch(':id')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Atualizar solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada' })
  async update(
    @Param('id') id: string,
    @Body() updateSolicitationDto: UpdateSolicitationDto,
  ) {
    return this.solicitationsService.update(id, updateSolicitationDto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação removida' })
  async remove(@Param('id') id: string) {
    return this.solicitationsService.remove(id)
  }

  @Post(':id/assign/responsibility')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Atribuir responsável à solicitação' })
  @ApiResponse({ status: 200, description: 'Responsável atribuído' })
  async assignResponsibility(
    @Param('id') id: string,
    @Body() assignDto: AssignResponsibilityDto,
  ) {
    return this.solicitationsService.assignResponsibility(id, assignDto)
  }
}


