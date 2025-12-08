import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from "bull";
import { ExportsService } from "../../modules/exports/exports.service";
import { ProcessExportJobDto } from "../dto/export-job.dto";
import { ExportType } from "../../modules/exports/dto";

@Processor("export-queue")
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(private readonly exportsService: ExportsService) {}

  @Process("process-export")
  async handleProcessExport(job: Job<ProcessExportJobDto>) {
    this.logger.log(`Processing export job ${job.id}`);

    const { userId, type, model, params } = job.data;

    try {
      this.logger.log(`Starting export generation: type: ${type}, model: ${model}`);

      const exportType = this.mapJobTypeToExportType(type);
      const { filePath, filename } = await this.exportsService.generateExport({
        type: exportType as ExportType,
        model,
        params,
      });

      this.logger.log(`Export completed successfully: ${filename}`);

      return {
        success: true,
        filename,
        filePath,
      };
    } catch (error) {
      this.logger.error(`Failed to process export: ${error.message}`, error.stack);

      throw error;
    }
  }

  private mapJobTypeToExportType(type: "CSV" | "XLSX" | "PDF" | "JSON"): "csv" | "xlsx" | "pdf" {
    const mapping: Record<string, "csv" | "xlsx" | "pdf"> = {
      CSV: "csv",
      XLSX: "xlsx",
      PDF: "pdf",
      JSON: "csv",
    };
    return mapping[type] || "csv";
  }
}
