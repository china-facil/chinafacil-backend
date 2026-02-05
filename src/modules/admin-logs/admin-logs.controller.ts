import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AdminLogsService } from './admin-logs.service'
import { FilterAdminLogDto } from './dto'

@ApiTags('admin-logs')
@Controller('admin-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminLogsController {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar logs de ações administrativas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs com paginação e filtros',
    schema: {
      example: {
        data: [
          {
            id: 'log-uuid',
            adminName: 'Admin User',
            adminEmail: 'admin@example.com',
            action: 'CREATE',
            resource: 'users',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll(@Query() filterDto: FilterAdminLogDto) {
    return this.adminLogsService.findAll(filterDto)
  }
}

