import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreateLeadDto, FilterLeadDto, LandingEkonomiDto, UpdateLeadDto } from './dto'
import { LeadsService } from './leads.service'

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Criar lead' })
  @ApiResponse({ status: 201, description: 'Lead criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 429, description: 'Muitas requisições. Limite: 10 por minuto' })
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Listar leads' })
  @ApiResponse({ status: 200, description: 'Lista de leads' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll(@Query() filterLeadDto: FilterLeadDto) {
    return this.leadsService.findAll(filterLeadDto)
  }

  @Get('stats/origin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Estatísticas por origem' })
  @ApiResponse({ status: 200, description: 'Stats por origem' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async getStatsByOrigin() {
    return this.leadsService.getStatsByOrigin()
  }

  @Get('stats/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Estatísticas por status' })
  @ApiResponse({ status: 200, description: 'Stats por status' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async getStatsByStatus() {
    return this.leadsService.getStatsByStatus()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter lead específico' })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Atualizar lead' })
  @ApiResponse({ status: 200, description: 'Lead atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto)
  }

  @Post(':id/convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Converter lead em usuário' })
  @ApiResponse({ status: 200, description: 'Lead convertido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async convertToUser(@Param('id') id: string) {
    return this.leadsService.convertToUser(id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Remover lead' })
  @ApiResponse({ status: 200, description: 'Lead removido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id)
  }

  @Post('landing-ekonomi')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Processar lead da landing page eKonomi' })
  @ApiResponse({ status: 201, description: 'Lead processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 429, description: 'Muitas requisições. Limite: 10 por minuto' })
  async storeLandingEkonomi(
    @Body() landingEkonomiDto: LandingEkonomiDto,
    @Ip() clientIp: string,
  ) {
    return this.leadsService.storeLandingEkonomi(landingEkonomiDto, clientIp)
  }
}
