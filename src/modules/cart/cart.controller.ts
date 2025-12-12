import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CartService } from './cart.service'
import { CreateCartDto, SyncCartDto, UpdateCartDto } from './dto'

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Criar ou atualizar carrinho' })
  @ApiResponse({ status: 201, description: 'Carrinho criado/atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto)
  }

  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Obter carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async getMyCart(@CurrentUser() user: any) {
    return this.cartService.findByUser(user.id)
  }

  @Get('all')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos os carrinhos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de carrinhos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll() {
    return this.cartService.findAll()
  }

  @Patch()
  @Roles('user', 'admin')
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

  @Delete('clear')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.id)
  }

  @Post('sync')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Sincronizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho sincronizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async sync(@CurrentUser() user: any, @Body() syncCartDto: SyncCartDto) {
    return this.cartService.sync(user.id, syncCartDto)
  }
}


