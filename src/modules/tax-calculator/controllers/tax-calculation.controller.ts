import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateTaxCalculationDto } from '../dto'
import { TaxCalculationService } from '../services/tax-calculation.service'

@ApiTags('tax-calculator')
@Controller('tax-calculations')
export class TaxCalculationController {
  constructor(
    private readonly taxCalculationService: TaxCalculationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar cálculo de impostos' })
  @ApiResponse({ status: 201, description: 'Cálculo criado' })
  async create(@Body() createTaxCalculationDto: CreateTaxCalculationDto) {
    return this.taxCalculationService.create(createTaxCalculationDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar cálculos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de cálculos' })
  async findAll() {
    return this.taxCalculationService.findAll()
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Listar cálculos por usuário' })
  @ApiResponse({ status: 200, description: 'Cálculos do usuário' })
  async findByUser(@Param('userId') userId: string) {
    return this.taxCalculationService.findByUser(userId)
  }
}

