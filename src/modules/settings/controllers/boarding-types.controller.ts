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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar tipo de embarque' })
  @ApiResponse({ status: 201, description: 'Tipo criado' })
  async create(@Body() createBoardingTypeDto: CreateBoardingTypeDto) {
    return this.boardingTypesService.create(createBoardingTypeDto)
  }

  @Get('boarding-types')
  @ApiOperation({ summary: 'Listar tipos de embarque' })
  @ApiResponse({ status: 200, description: 'Lista de tipos' })
  async findAll() {
    return this.boardingTypesService.findAll()
  }

  @Get('boarding-types/active')
  @ApiOperation({ summary: 'Listar tipos ativos' })
  @ApiResponse({ status: 200, description: 'Tipos ativos' })
  async findActive() {
    return this.boardingTypesService.findActive()
  }

  @Get('default-boarding-type')
  @ApiOperation({ summary: 'Obter tipo padrão (público)' })
  @ApiResponse({ status: 200, description: 'Tipo padrão' })
  async findDefault() {
    return this.boardingTypesService.findDefault()
  }

  @Get('boarding-types/:id')
  @ApiOperation({ summary: 'Obter tipo específico' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  async findOne(@Param('id') id: string) {
    return this.boardingTypesService.findOne(id)
  }

  @Patch('boarding-types/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar tipo' })
  @ApiResponse({ status: 200, description: 'Tipo atualizado' })
  async update(
    @Param('id') id: string,
    @Body() updateBoardingTypeDto: UpdateBoardingTypeDto,
  ) {
    return this.boardingTypesService.update(id, updateBoardingTypeDto)
  }

  @Delete('boarding-types/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover tipo' })
  @ApiResponse({ status: 200, description: 'Tipo removido' })
  async remove(@Param('id') id: string) {
    return this.boardingTypesService.remove(id)
  }
}


