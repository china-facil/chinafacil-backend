import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { QuotationService } from "../settings/services/quotation.service";
import { RequestExportDto, ExportType } from "./dto";
import { UserResource, SolicitationResource, PlanResource } from "./resources";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationService: QuotationService
  ) {}

  async generateExport(requestExportDto: RequestExportDto): Promise<{ filePath: string; filename: string }> {
    const { type, model, params } = requestExportDto;

    const filename = this.getFilename(model);
    const data = await this.getDataForExport(model, params);

    if (!data || data.length === 0) {
      throw new NotFoundException("Nenhum dado encontrado para exportação");
    }

    let filePath: string;

    switch (type) {
      case ExportType.CSV:
        filePath = await this.exportToCSV(filename, data);
        break;
      case ExportType.XLSX:
        filePath = await this.exportToXLSX(filename, data);
        break;
      case ExportType.PDF:
        filePath = await this.exportToPDF(filename, data, params);
        break;
      default:
        throw new Error(`Tipo de exportação não suportado: ${type}`);
    }

    return {
      filePath,
      filename: `${filename}.${this.getExtension(type)}`,
    };
  }

  private getFilename(model: string): string {
    const filenames: Record<string, string> = {
      User: "Usuarios",
      Plan: "Planos",
      Solicitation: "Solicitacoes",
    };
    return filenames[model] || "Exportacao";
  }

  private getExtension(type: ExportType): string {
    const extensions: Record<ExportType, string> = {
      [ExportType.CSV]: "csv",
      [ExportType.XLSX]: "xlsx",
      [ExportType.PDF]: "pdf",
    };
    return extensions[type];
  }

  private async getDataForExport(model: string, params?: Record<string, any>): Promise<Record<string, any>[]> {
    this.logger.log(`Buscando dados para exportação, modelo: ${model}`);

    let data: Record<string, any>[] = [];

    switch (model) {
      case "User": {
        const query: any = {
          take: 500,
          orderBy: { createdAt: "desc" },
        };

        if (params?.roles) {
          const roles = Array.isArray(params.roles) ? params.roles : params.roles.split(", ");
          query.where = { role: { in: roles } };
        }

        const users = await this.prisma.user.findMany(query);
        data = users.map((user) => {
          const resource = new UserResource({ ...user, type: params?.type });
          return resource.toArray();
        });
        break;
      }

      case "Solicitation": {
        const solicitations = await this.prisma.solicitation.findMany({
          take: 500,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            cart: true,
          },
          orderBy: { createdAt: "desc" },
        });

        data = await Promise.all(
          solicitations.map(async (solicitation) => {
            const resource = new SolicitationResource(solicitation, this.quotationService);
            return await resource.toArray();
          })
        );
        break;
      }

      case "Plan": {
        const plans = await this.prisma.client.findMany({
          take: 500,
          orderBy: { createdAt: "desc" },
        });

        data = plans.map((plan) => {
          const resource = new PlanResource(plan);
          return resource.toArray();
        });
        break;
      }

      default:
        throw new Error(`Modelo não suportado para exportação: ${model}`);
    }

    return data;
  }

  private async exportToCSV(filename: string, data: Record<string, any>[]): Promise<string> {
    this.logger.log(`Gerando exportação CSV: ${filename}`);

    if (data.length === 0) {
      throw new Error("Nenhum dado encontrado para exportação");
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) {
              return "";
            }
            if (typeof value === "object") {
              return JSON.stringify(value).replace(/"/g, '""');
            }
            return String(value).replace(/"/g, '""');
          })
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const exportFilename = `${filename}.csv`;
    const filePath = path.join(process.cwd(), "public", "export", exportFilename);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, csvContent, "utf-8");

    return `/export/${exportFilename}`;
  }

  private async exportToXLSX(filename: string, data: Record<string, any>[]): Promise<string> {
    this.logger.log(`Gerando exportação XLSX: ${filename}`);
    this.logger.warn("Exportação XLSX requer biblioteca exceljs. Retornando CSV temporariamente.");

    return this.exportToCSV(filename, data);
  }

  private async exportToPDF(
    filename: string,
    data: Record<string, any>[],
    params?: Record<string, any>
  ): Promise<string> {
    this.logger.log(`Gerando exportação PDF: ${filename}`);
    this.logger.warn("Exportação PDF requer biblioteca pdfkit. Retornando JSON temporariamente.");

    const jsonFilename = `${filename}.json`;
    const filePath = path.join(process.cwd(), "public", "export", jsonFilename);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    return `/export/${jsonFilename}`;
  }
}
