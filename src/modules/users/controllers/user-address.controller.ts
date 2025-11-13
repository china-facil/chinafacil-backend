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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from '../dto'
import { UserAddressService } from '../services/user-address.service'

@ApiTags('users')
@Controller('user-addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserAddressController {
  constructor(
    private readonly userAddressService: UserAddressService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createUserAddressDto: CreateUserAddressDto,
  ) {
    return this.userAddressService.create(userId, createUserAddressDto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar endereços do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de endereços' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.userAddressService.findAll(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um endereço' })
  @ApiResponse({ status: 200, description: 'Detalhes do endereço' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.userAddressService.findOne(id, userId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
  ) {
    return this.userAddressService.update(id, userId, updateUserAddressDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover endereço' })
  @ApiResponse({ status: 200, description: 'Endereço removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.userAddressService.remove(id, userId)
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Definir endereço como padrão' })
  @ApiResponse({
    status: 200,
    description: 'Endereço padrão atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.userAddressService.setDefault(id, userId)
  }
}

