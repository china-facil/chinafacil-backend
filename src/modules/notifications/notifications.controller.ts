import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { CreateNotificationDto, FilterNotificationDto } from './dto'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar notificação (admin)' })
  @ApiResponse({ status: 201, description: 'Notificação criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto)
  }

  @Get()
  @Roles('user', 'admin', 'seller')
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findByUser(
    @CurrentUser() user: any,
    @Query() filterDto: FilterNotificationDto,
  ) {
    return this.notificationsService.findByUser(user.id, filterDto)
  }

  @Put(':id/read')
  @Roles('user', 'admin', 'seller')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id)
  }

  @Put('mark-all-as-read')
  @Roles('user', 'admin', 'seller')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Notificações marcadas como lidas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id)
  }

  @Put('mark-all-as-unread')
  @Roles('user', 'admin', 'seller')
  @ApiOperation({ summary: 'Marcar todas as notificações como não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Notificações marcadas como não lidas',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async markAllAsUnread(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsUnread(user.id)
  }

  @Delete()
  @Roles('user', 'admin', 'seller')
  @ApiOperation({ summary: 'Remover todas as notificações' })
  @ApiResponse({ status: 200, description: 'Notificações removidas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async deleteAll(@CurrentUser() user: any) {
    return this.notificationsService.deleteAll(user.id)
  }
}


