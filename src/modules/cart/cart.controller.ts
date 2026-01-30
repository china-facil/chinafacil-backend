import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CartService } from './cart.service'
import { CreateCartDto, SyncCartDto, UpdateCartDto, GenerateReportDto } from './dto'

@ApiTags('cart')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('cart')
  @Roles('user', 'admin', 'seller', 'lead', 'client')
  @ApiOperation({ summary: 'Criar ou atualizar carrinho' })
  @ApiResponse({ status: 201, description: 'Carrinho criado/atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto)
  }

  @Get('cart')
  @Roles('user', 'admin', 'seller', 'lead', 'client')
  @ApiOperation({ summary: 'Obter carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async getMyCart(@CurrentUser() user: any) {
    return this.cartService.findByUser(user.id)
  }

  @Get('cart/all')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos os carrinhos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de carrinhos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
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
  @Roles('user', 'admin', 'seller', 'lead', 'client')
  @ApiOperation({ summary: 'Atualizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
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
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.id)
  }

  @Post('cart/sync')
  @Roles('user', 'admin', 'seller', 'lead', 'client')
  @ApiOperation({ summary: 'Sincronizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho sincronizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async sync(@CurrentUser() user: any, @Body() syncCartDto: SyncCartDto) {
    return this.cartService.sync(user.id, syncCartDto)
  }

  @Post('cart/report')
  @Public()
  @ApiOperation({ summary: 'Gerar relatório PDF do carrinho' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Dados do carrinho',
        },
        detailed: {
          type: 'boolean',
          description: 'Se deve gerar versão detalhada',
          default: false,
        },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PDF gerado com sucesso',
    content: {
      'application/pdf': {},
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Dados inválidos ou produtos não encontrados' })
  @ApiResponse({ status: 500, description: 'Erro ao gerar PDF' })
  async generateReport(
    @Body() generateReportDto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const { data, detailed = false } = generateReportDto
    const pdfBuffer = await this.cartService.generateReport(data, detailed)
    
    const filename = detailed
      ? `relatorio-detalhado-${new Date().toISOString().slice(0, 16).replace(/[-:]/g, '')}.pdf`
      : `relatorio-${new Date().toISOString().slice(0, 16).replace(/[-:]/g, '')}.pdf`

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })

    res.send(pdfBuffer)
  }

}


