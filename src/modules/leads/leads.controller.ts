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
import { CreateLeadDto, FilterLeadDto, UpdateLeadDto } from './dto'
import { LeadsService } from './leads.service'

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Criar lead' })
  @ApiResponse({ status: 201, description: 'Lead criado' })
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
  async findAll(@Query() filterLeadDto: FilterLeadDto) {
    return this.leadsService.findAll(filterLeadDto)
  }

  @Get('stats/origin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Estatísticas por origem' })
  @ApiResponse({ status: 200, description: 'Stats por origem' })
  async getStatsByOrigin() {
    return this.leadsService.getStatsByOrigin()
  }

  @Get('stats/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Estatísticas por status' })
  @ApiResponse({ status: 200, description: 'Stats por status' })
  async getStatsByStatus() {
    return this.leadsService.getStatsByStatus()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter lead específico' })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Atualizar lead' })
  @ApiResponse({ status: 200, description: 'Lead atualizado' })
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto)
  }

  @Post(':id/convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Converter lead em usuário' })
  @ApiResponse({ status: 200, description: 'Lead convertido' })
  async convertToUser(@Param('id') id: string) {
    return this.leadsService.convertToUser(id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Remover lead' })
  @ApiResponse({ status: 200, description: 'Lead removido' })
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id)
  }
}


