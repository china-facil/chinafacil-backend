import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LogsService } from "./logs.service";

@ApiTags("logs")
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: "Listar arquivos de log" })
  @ApiResponse({ status: 200, description: "Lista de arquivos de log" })
  async getLogFiles() {
    const files = await this.logsService.getLogFiles();
    return { files };
  }

  @Get("search/query")
  @ApiOperation({ summary: "Buscar logs" })
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "level", required: false })
  @ApiResponse({ status: 200, description: "Resultados da busca" })
  async searchLogs(@Query("q") query?: string, @Query("level") level?: string) {
    const logs = await this.logsService.searchLogs(query || "", level);
    return { logs };
  }

  @Get(":filename")
  @ApiOperation({ summary: "Obter conteúdo de arquivo de log" })
  @ApiResponse({ status: 200, description: "Conteúdo do arquivo de log" })
  @ApiResponse({ status: 404, description: "Arquivo não encontrado" })
  async getLogContent(@Param("filename") filename: string) {
    const logs = await this.logsService.getLogContent(filename);
    return { logs };
  }

  @Delete()
  @ApiOperation({ summary: "Limpar todos os logs (apenas admin)" })
  @ApiResponse({ status: 200, description: "Logs limpos com sucesso" })
  async clearLogs() {
    await this.logsService.clearLogs();
    return { message: "Todos os logs foram limpos com sucesso" };
  }
}
