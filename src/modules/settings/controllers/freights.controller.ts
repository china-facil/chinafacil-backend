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
import {
  CalculateFreightDto,
  CreateFreightDto,
  UpdateFreightDto,
} from '../dto'
import { FreightsService } from '../services/freights.service'

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FreightsController {
  constructor(private readonly freightsService: FreightsService) {}

  @Post('freights')
  @Roles('admin')
  @ApiOperation({ summary: 'Criar frete' })
  @ApiResponse({ status: 201, description: 'Frete criado' })
  async create(@Body() createFreightDto: CreateFreightDto) {
    return this.freightsService.create(createFreightDto)
  }

  @Get('freights')
  @ApiOperation({ summary: 'Listar fretes' })
  @ApiResponse({ status: 200, description: 'Lista de fretes' })
  async findAll() {
    return this.freightsService.findAll()
  }

  @Get('freights/:id')
  @ApiOperation({ summary: 'Obter frete específico' })
  @ApiResponse({ status: 200, description: 'Frete encontrado' })
  async findOne(@Param('id') id: string) {
    return this.freightsService.findOne(id)
  }

  @Patch('freights/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar frete' })
  @ApiResponse({ status: 200, description: 'Frete atualizado' })
  async update(
    @Param('id') id: string,
    @Body() updateFreightDto: UpdateFreightDto,
  ) {
    return this.freightsService.update(id, updateFreightDto)
  }

  @Delete('freights/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover frete' })
  @ApiResponse({ status: 200, description: 'Frete removido' })
  async remove(@Param('id') id: string) {
    return this.freightsService.remove(id)
  }

  @Post('frete/calcular')
  @ApiOperation({ summary: 'Calcular frete nacional' })
  @ApiResponse({ status: 200, description: 'Cálculo de frete realizado' })
  @ApiResponse({ status: 404, description: 'Frete não encontrado' })
  async calculateFreight(@Body() calculateFreightDto: CalculateFreightDto) {
    return this.freightsService.calculateFreight(calculateFreightDto)
  }
}


