import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CartService } from './cart.service'
import { PdfGeneratorService } from './services/pdf-generator.service'
import { CreateCartDto, SyncCartDto, UpdateCartDto } from './dto'

@ApiTags('cart')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post('cart')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Criar ou atualizar carrinho' })
  @ApiResponse({ status: 201, description: 'Carrinho criado/atualizado' })
  async create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto)
  }

  @Get('cart')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Obter carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho do usuário' })
  async getMyCart(@CurrentUser() user: any) {
    return this.cartService.findByUser(user.id)
  }

  @Get('cart/all')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos os carrinhos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de carrinhos' })
  async findAll() {
    return this.cartService.findAll()
  }

  @Get('carts')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar carrinhos para admin com paginação' })
  @ApiQuery({ name: 'items_per_page', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'date_start', required: false, type: String })
  @ApiQuery({ name: 'date_end', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'order-key', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de carrinhos paginada' })
  async adminList(
    @Query('items_per_page') itemsPerPage?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('date_start') dateStart?: string,
    @Query('date_end') dateEnd?: string,
    @Query('order') order?: string,
    @Query('order-key') orderKey?: string,
  ) {
    return this.cartService.adminList({
      itemsPerPage: itemsPerPage ? parseInt(itemsPerPage) : 25,
      page: page ? parseInt(page) : 1,
      search,
      dateStart,
      dateEnd,
      order: order as 'asc' | 'desc',
      orderKey,
    })
  }

  @Patch('cart')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Atualizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho atualizado' })
  async update(
    @CurrentUser() user: any,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const cart = await this.cartService.findByUser(user.id)
    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }
    return this.cartService.update(cart.id, updateCartDto)
  }

  @Delete('cart/clear')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo' })
  async clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.id)
  }

  @Post('cart/sync')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Sincronizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho sincronizado' })
  async sync(@CurrentUser() user: any, @Body() syncCartDto: SyncCartDto) {
    return this.cartService.sync(user.id, syncCartDto)
  }

  @Post('cart/report-tax-calculator')
  @Public()
  @ApiOperation({ summary: 'Gerar relatório PDF da calculadora de impostos' })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Header('Content-Type', 'application/pdf')
  async generateTaxCalculatorReport(
    @Body() body: { data: any; detailed?: boolean },
    @Res() res: Response,
  ) {
    const detailed = body.detailed || false
    const pdfBuffer = detailed
      ? await this.pdfGeneratorService.generateTaxCalculatorDetailedPdf(body.data)
      : await this.pdfGeneratorService.generateTaxCalculatorSummaryPdf(body.data)

    const filename = detailed ? 'calculadora-impostos-detalhado.pdf' : 'calculadora-impostos.pdf'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.end(pdfBuffer)
  }

  @Post('cart/report')
  @Public()
  @ApiOperation({ summary: 'Gerar relatório PDF do carrinho' })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Header('Content-Type', 'application/pdf')
  async generateCartReport(
    @Body() body: { data: any; detailed?: boolean },
    @Res() res: Response,
  ) {
    const detailed = body.detailed || false
    const pdfBuffer = detailed
      ? await this.pdfGeneratorService.generateTaxCalculatorDetailedPdf(body.data)
      : await this.pdfGeneratorService.generateTaxCalculatorSummaryPdf(body.data)

    const filename = detailed ? 'relatorio-detalhado.pdf' : 'relatorio.pdf'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.end(pdfBuffer)
  }
}


