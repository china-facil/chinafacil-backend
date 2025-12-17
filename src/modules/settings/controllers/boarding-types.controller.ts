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
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { CreateBoardingTypeDto, UpdateBoardingTypeDto } from '../dto'
import { BoardingTypesService } from '../services/boarding-types.service'

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BoardingTypesController {
  constructor(private readonly boardingTypesService: BoardingTypesService) {}

  @Post('boarding-types')
  @Roles('admin')
  @ApiOperation({ summary: 'Criar tipo de embarque' })
  @ApiResponse({ status: 201, description: 'Tipo criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createBoardingTypeDto: CreateBoardingTypeDto) {
    return this.boardingTypesService.create(createBoardingTypeDto)
  }

  @Get('boarding-types')
  @ApiOperation({ summary: 'Listar tipos de embarque' })
  @ApiResponse({ status: 200, description: 'Lista de tipos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll() {
    return this.boardingTypesService.findAll()
  }

  @Get('boarding-types/active')
  @ApiOperation({ summary: 'Listar tipos ativos' })
  @ApiResponse({ status: 200, description: 'Tipos ativos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findActive() {
    return this.boardingTypesService.findActive()
  }

  @Get('default-boarding-type')
  @ApiOperation({ summary: 'Obter tipo padrão (público)' })
  @ApiResponse({ status: 200, description: 'Tipo padrão' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findDefault() {
    return this.boardingTypesService.findDefault()
  }

  @Get('boarding-types/:id')
  @ApiOperation({ summary: 'Obter tipo específico' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.boardingTypesService.findOne(id)
  }

  @Patch('boarding-types/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar tipo' })
  @ApiResponse({ status: 200, description: 'Tipo atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateBoardingTypeDto: UpdateBoardingTypeDto,
  ) {
    return this.boardingTypesService.update(id, updateBoardingTypeDto)
  }

  @Delete('boarding-types/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover tipo' })
  @ApiResponse({ status: 200, description: 'Tipo removido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado' })
  async remove(@Param('id') id: string) {
    return this.boardingTypesService.remove(id)
  }
}


