import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { CreateSolicitationItemDto } from '../dto'
import { SolicitationItemsService } from '../services/solicitation-items.service'

@ApiTags('solicitations')
@Controller('solicitations/:solicitationId/items')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitationItemsController {
  constructor(
    private readonly solicitationItemsService: SolicitationItemsService,
  ) {}

  @Post()
  @Roles('admin', 'seller', 'user', 'lead', 'sourcer')
  @ApiOperation({ summary: 'Adicionar item à solicitação' })
  @ApiResponse({ status: 201, description: 'Item adicionado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  async addItem(
    @Param('solicitationId') solicitationId: string,
    @CurrentUser('id') userId: string,
    @Body() createItemDto: CreateSolicitationItemDto,
  ) {
    return this.solicitationItemsService.addItem(solicitationId, userId, createItemDto)
  }

  @Delete(':itemId')
  @Roles('admin', 'seller', 'user', 'lead', 'sourcer')
  @ApiOperation({ summary: 'Remover item da solicitação' })
  @ApiResponse({ status: 200, description: 'Item removido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async removeItem(
    @Param('solicitationId') solicitationId: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.solicitationItemsService.removeItem(solicitationId, itemId, userId, userRole)
  }
}
