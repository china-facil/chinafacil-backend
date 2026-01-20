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
@Controller()
export class TaxCalculationController {
  constructor(
    private readonly taxCalculationService: TaxCalculationService,
  ) {}

  @Post('tax-calculations')
  @ApiOperation({ summary: 'Criar cálculo de impostos' })
  @ApiResponse({ status: 201, description: 'Cálculo criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createTaxCalculationDto: CreateTaxCalculationDto) {
    return this.taxCalculationService.create(createTaxCalculationDto)
  }

  @Get('tax-calculations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar cálculos com filtros e paginação (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de cálculos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'ncmCode', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filterDto: FilterTaxCalculationDto) {
    return this.taxCalculationService.findAll(filterDto)
  }

  @Get('tax-calculations-list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar cálculos para admin com paginação' })
  @ApiQuery({ name: 'items_per_page', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'date_start', required: false, type: String })
  @ApiQuery({ name: 'date_end', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'order-key', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de cálculos paginada' })
  async adminList(
    @Query('items_per_page') itemsPerPage?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('date_start') dateStart?: string,
    @Query('date_end') dateEnd?: string,
    @Query('order') order?: string,
    @Query('order-key') orderKey?: string,
  ) {
    return this.taxCalculationService.adminList({
      itemsPerPage: itemsPerPage ? parseInt(itemsPerPage) : 25,
      page: page ? parseInt(page) : 1,
      search,
      dateStart,
      dateEnd,
      order: order as 'asc' | 'desc',
      orderKey,
    })
  }

  @Get('tax-calculations/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Listar cálculos por usuário' })
  @ApiResponse({ status: 200, description: 'Cálculos do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findByUser(@Param('userId') userId: string) {
    return this.taxCalculationService.findByUser(userId)
  }
}


