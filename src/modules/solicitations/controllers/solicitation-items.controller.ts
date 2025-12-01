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
  @Roles('admin', 'seller', 'user')
  @ApiOperation({ summary: 'Adicionar item à solicitação' })
  @ApiResponse({ status: 201, description: 'Item adicionado' })
  async addItem(
    @Param('solicitationId') solicitationId: string,
    @Body() createItemDto: CreateSolicitationItemDto,
  ) {
    return this.solicitationItemsService.addItem(solicitationId, createItemDto)
  }

  @Delete(':itemId')
  @Roles('admin', 'seller', 'user')
  @ApiOperation({ summary: 'Remover item da solicitação' })
  @ApiResponse({ status: 200, description: 'Item removido' })
  async removeItem(
    @Param('solicitationId') solicitationId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.solicitationItemsService.removeItem(solicitationId, itemId)
  }
}


