import { Body, Controller, Post, Res, UseGuards, HttpStatus, NotFoundException, HttpCode } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import * as fs from "fs/promises";
import * as path from "path";
import { createReadStream } from "fs";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequestExportDto } from "./dto";
import { ExportsService } from "./exports.service";
import { ProcessExportJobDto } from "../../jobs/dto/export-job.dto";

@ApiTags("exports")
@Controller("exports")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService,
    @InjectQueue("export-queue") private readonly exportQueue: Queue
  ) {}

  @Post("request")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Solicitar exportação (processamento assíncrono)" })
  @ApiResponse({ status: 200, description: "Exportação solicitada com sucesso" })
  async requestExport(@CurrentUser() user: any, @Body() requestExportDto: RequestExportDto) {
    const job = await this.exportQueue.add(
      "process-export",
      {
        userId: user.id,
        type: requestExportDto.type.toUpperCase(),
        model: requestExportDto.model,
        params: requestExportDto.params,
      } as ProcessExportJobDto,
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    return {
      status: "success",
      message: "Estamos gerando seu relatório, assim que estiver pronto enviaremos ao seu e-mail!",
      jobId: job.id,
    };
  }

  @Post("download-direct")
  @ApiOperation({ summary: "Gerar e baixar exportação diretamente" })
  @ApiResponse({ status: 200, description: "Arquivo gerado e disponível para download" })
  @ApiResponse({ status: 404, description: "Nenhum dado encontrado" })
  async downloadDirect(@Body() requestExportDto: RequestExportDto, @Res() res: Response) {
    try {
      const { filePath, filename } = await this.exportsService.generateExport(requestExportDto);

      const fullPath = path.join(process.cwd(), "public", filePath);

      const mimeTypes: Record<string, string> = {
        csv: "text/csv",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf: "application/pdf",
      };

      const extension = filename.split(".").pop() || "csv";
      const mimeType = mimeTypes[extension] || "application/octet-stream";

      res.status(HttpStatus.OK);
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      const fileStream = createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: "error",
          message: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Erro ao gerar o arquivo de exportação",
      });
    }
  }
}
