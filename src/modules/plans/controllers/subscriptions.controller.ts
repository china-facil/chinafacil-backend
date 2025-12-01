import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto'
import { SubscriptionsService } from '../services/subscriptions.service'

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar nova assinatura' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário já possui assinatura' })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto)
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todas as assinaturas' })
  @ApiResponse({ status: 200, description: 'Lista de assinaturas' })
  async findAll() {
    return this.subscriptionsService.findAll()
  }

  @Get('user/:userId')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Obter assinatura de um usuário' })
  @ApiResponse({ status: 200, description: 'Assinatura do usuário' })
  async findByUser(@Param('userId') userId: string) {
    return this.subscriptionsService.findByUser(userId)
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obter detalhes de uma assinatura' })
  @ApiResponse({ status: 200, description: 'Detalhes da assinatura' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.findOne(id)
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.remove(id)
  }

  @Post(':id/cancel')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Cancelar assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.cancel(id)
  }

  @Post(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Ativar assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura ativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.activate(id)
  }
}


