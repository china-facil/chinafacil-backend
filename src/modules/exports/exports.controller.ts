import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RequestExportDto } from './dto'
import { ExportsService } from './exports.service'

@ApiTags('exports')
@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Solicitar exportação' })
  @ApiResponse({ status: 201, description: 'Exportação solicitada' })
  async requestExport(
    @Request() req,
    @Body() requestExportDto: RequestExportDto,
  ) {
    return this.exportsService.requestExport(req.user.id, requestExportDto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar exportações' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de exportações' })
  async findAll(@Query('userId') userId?: string) {
    return this.exportsService.findAll(userId)
  }

  @Get('pending')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar exportações pendentes' })
  @ApiResponse({ status: 200, description: 'Exportações pendentes' })
  async getPendingExports() {
    return this.exportsService.getPendingExports()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter exportação específica' })
  @ApiResponse({ status: 200, description: 'Exportação encontrada' })
  async findOne(@Param('id') id: string) {
    return this.exportsService.findOne(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover exportação' })
  @ApiResponse({ status: 200, description: 'Exportação removida' })
  async remove(@Param('id') id: string) {
    return this.exportsService.delete(id)
  }
}

