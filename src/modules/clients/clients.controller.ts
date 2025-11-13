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
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ClientsService } from './clients.service'
import { CreateClientDto, FilterClientDto, UpdateClientDto } from './dto'

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto)
  }

  @Get()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar clientes com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  async findAll(@Query() filterDto: FilterClientDto) {
    return this.clientsService.findAll(filterDto)
  }

  @Get('active-plans')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar clientes com planos ativos' })
  @ApiResponse({ status: 200, description: 'Lista de clientes com planos ativos' })
  async findActivePlans() {
    return this.clientsService.findActivePlans()
  }

  @Get(':id')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Obter detalhes de um cliente' })
  @ApiResponse({ status: 200, description: 'Detalhes do cliente' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id)
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover cliente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cliente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id)
  }

  @Post(':clientId/users/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Vincular usuário ao cliente' })
  @ApiResponse({ status: 200, description: 'Usuário vinculado com sucesso' })
  async attachUser(
    @Param('clientId') clientId: string,
    @Param('userId') userId: string,
  ) {
    return this.clientsService.attachUser(clientId, userId)
  }

  @Delete(':clientId/users/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desvincular usuário do cliente' })
  @ApiResponse({ status: 200, description: 'Usuário desvinculado com sucesso' })
  async detachUser(
    @Param('clientId') clientId: string,
    @Param('userId') userId: string,
  ) {
    return this.clientsService.detachUser(clientId, userId)
  }
}


