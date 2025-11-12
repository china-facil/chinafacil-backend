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
import { CreateFreightDto, UpdateFreightDto } from '../dto'
import { FreightsService } from '../services/freights.service'

@ApiTags('settings')
@Controller('freights')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FreightsController {
  constructor(private readonly freightsService: FreightsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar frete' })
  @ApiResponse({ status: 201, description: 'Frete criado' })
  async create(@Body() createFreightDto: CreateFreightDto) {
    return this.freightsService.create(createFreightDto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar fretes' })
  @ApiResponse({ status: 200, description: 'Lista de fretes' })
  async findAll() {
    return this.freightsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter frete específico' })
  @ApiResponse({ status: 200, description: 'Frete encontrado' })
  async findOne(@Param('id') id: string) {
    return this.freightsService.findOne(id)
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar frete' })
  @ApiResponse({ status: 200, description: 'Frete atualizado' })
  async update(
    @Param('id') id: string,
    @Body() updateFreightDto: UpdateFreightDto,
  ) {
    return this.freightsService.update(id, updateFreightDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover frete' })
  @ApiResponse({ status: 200, description: 'Frete removido' })
  async remove(@Param('id') id: string) {
    return this.freightsService.remove(id)
  }
}

