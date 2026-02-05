import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SellersService } from './sellers.service'
import { CreateSellerDto, FilterSellerDto, UpdateSellerDto } from './dto'

@ApiTags('sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo vendedor' })
  @ApiResponse({
    status: 201,
    description: 'Vendedor criado com sucesso',
    schema: {
      example: {
        id: 'seller-uuid',
        userId: 'user-uuid',
        name: 'João Silva',
        email: 'joao@example.com',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        user: {
          id: 'user-uuid',
          name: 'João Silva',
          email: 'joao@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.create(createSellerDto)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar vendedores com paginação e filtros (público)' })
  @ApiResponse({ status: 200, description: 'Lista de vendedores' })
  async findAll(@Query() filterDto: FilterSellerDto) {
    return this.sellersService.findAll(filterDto)
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obter detalhes de um vendedor' })
  @ApiResponse({ status: 200, description: 'Detalhes do vendedor' })
  @ApiResponse({ status: 404, description: 'Vendedor não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findOne(@Param('id') id: string) {
    return this.sellersService.findOne(id)
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar vendedor' })
  @ApiResponse({ status: 200, description: 'Vendedor atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já cadastrado' })
  @ApiResponse({ status: 404, description: 'Vendedor não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return this.sellersService.update(id, updateSellerDto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover vendedor' })
  @ApiResponse({ status: 200, description: 'Vendedor removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Vendedor possui clientes vinculados' })
  @ApiResponse({ status: 404, description: 'Vendedor não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(@Param('id') id: string) {
    return this.sellersService.remove(id)
  }
}
