import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateCartDto, UpdateCartDto } from './dto'

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Criar ou atualizar carrinho' })
  @ApiResponse({ status: 201, description: 'Carrinho criado/atualizado' })
  async create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto)
  }

  @Get()
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Obter carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho do usuário' })
  async getMyCart(@CurrentUser() user: any) {
    return this.cartService.findByUser(user.id)
  }

  @Get('all')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos os carrinhos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de carrinhos' })
  async findAll() {
    return this.cartService.findAll()
  }

  @Patch()
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Atualizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho atualizado' })
  async update(
    @CurrentUser() user: any,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const cart = await this.cartService.findByUser(user.id)
    return this.cartService.update(cart.id, updateCartDto)
  }

  @Delete('clear')
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo' })
  async clear(@CurrentUser() user: any) {
    return this.cartService.clear(user.id)
  }

  @Post('sync')
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Sincronizar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho sincronizado' })
  async sync(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.sync(user.id, createCartDto)
  }
}

