import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
// import { RolesGuard } from '../guards/roles.guard';
// import { Roles } from '../decorators/roles.decorator';

@ApiTags('logs')
@Controller('logs')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
// @ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'List all log files' })
  async getLogFiles() {
    const files = await this.logsService.getLogFiles();
    return { files };
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Get log file content' })
  async getLogContent(@Param('filename') filename: string) {
    const logs = await this.logsService.getLogContent(filename);
    return { logs };
  }

  @Get('search/query')
  @ApiOperation({ summary: 'Search logs' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'level', required: false })
  async searchLogs(@Query('q') query?: string, @Query('level') level?: string) {
    const logs = await this.logsService.searchLogs(query || '', level);
    return { logs };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all logs (Admin only)' })
  async clearLogs() {
    await this.logsService.clearLogs();
    return { message: 'All logs cleared successfully' };
  }
}

