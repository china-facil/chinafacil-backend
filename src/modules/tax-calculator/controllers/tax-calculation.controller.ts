import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import {
  CreateTaxCalculationDto,
  FilterTaxCalculationDto,
} from '../dto'
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
  @Roles('admin')
  @ApiOperation({ summary: 'Listar cálculos com filtros e paginação (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de cálculos' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'ncmCode', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filterDto: FilterTaxCalculationDto) {
    return this.taxCalculationService.findAll(filterDto)
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Listar cálculos por usuário' })
  @ApiResponse({ status: 200, description: 'Cálculos do usuário' })
  async findByUser(@Param('userId') userId: string) {
    return this.taxCalculationService.findByUser(userId)
  }
}


