import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { QuotationService } from "../settings/services/quotation.service";
import { RequestExportDto, ExportType } from "./dto";
import { UserResource, SolicitationResource, PlanResource } from "./resources";
import { SubscriptionStatus } from "@prisma/client";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import * as ExcelJS from "exceljs";
const PDFDocument = require("pdfkit");

@Injectable()
export class ExportsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationService: QuotationService
  ) {}

  async generateExport(requestExportDto: RequestExportDto): Promise<{ filePath: string; filename: string }> {
    const { type, model, roles, params } = requestExportDto;
    const mergedParams = { ...params, ...(roles && { roles }) };

    const filename = this.getFilename(model);
    const data = await this.getDataForExport(model, mergedParams);

    if (!data || data.length === 0) {
      throw new NotFoundException("Nenhum dado encontrado para exportação");
    }

    let filePath: string;
    let actualExtension: string;

    switch (type) {
      case ExportType.CSV:
        filePath = await this.exportToCSV(filename, data);
        actualExtension = "csv";
        break;
      case ExportType.XLSX:
        filePath = await this.exportToXLSX(filename, data);
        actualExtension = "xlsx";
        break;
      case ExportType.PDF:
        filePath = await this.exportToPDF(filename, data, params);
        actualExtension = "pdf";
        break;
      default:
        throw new Error(`Tipo de exportação não suportado: ${type}`);
    }

    return {
      filePath,
      filename: `${filename}.${actualExtension}`,
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

  private async getDataForExport(model: string, params?: Record<string, any>): Promise<Record<string, any>[]> {

    let data: Record<string, any>[] = [];

    switch (model) {
      case "User": {
        const query: any = {
          take: 500,
          orderBy: { createdAt: "desc" },
        };

        if (params?.roles) {
          const roles = Array.isArray(params.roles) ? params.roles : params.roles.split(", ").map((r: string) => r.trim());
          
          const hasClientRole = roles.includes("client");
          const otherRoles = roles.filter((r: string) => r !== "client");

          if (hasClientRole) {
            const activeSubscriptions = await this.prisma.subscription.findMany({
              where: {
                status: SubscriptionStatus.active,
              },
              select: {
                userId: true,
              },
            });

            const clientUserIds = activeSubscriptions.map((sub) => sub.userId);

            if (otherRoles.length > 0) {
              if (clientUserIds.length > 0) {
                query.where = {
                  OR: [
                    { id: { in: clientUserIds } },
                    { role: { in: otherRoles } },
                  ],
                };
              } else {
                query.where = {
                  role: { in: otherRoles },
                };
              }
            } else {
              if (clientUserIds.length > 0) {
                query.where = {
                  id: { in: clientUserIds },
                };
              } else {
                query.where = {
                  id: { in: [] },
                };
              }
            }
          } else {
            query.where = { role: { in: roles } };
          }
        }

        const users = await this.prisma.user.findMany(query);
        data = users.map((user) => {
          const resource = new UserResource({ ...user, type: params?.type });
          return resource.toArray();
        });
        break;
      }

      case "Solicitation": {
        const validUserIds = await this.prisma.user.findMany({
          select: { id: true },
        });
        const validUserIdArray = validUserIds.map((u) => u.id).filter((id) => id !== null && id !== undefined);

        const whereFilter: any = {};
        if (validUserIdArray.length > 0) {
          whereFilter.userId = {
            in: validUserIdArray,
          };
        } else {
          whereFilter.userId = {
            in: [],
          };
        }

        const solicitations = await this.prisma.solicitation.findMany({
          where: whereFilter,
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
            try {
              const resource = new SolicitationResource(solicitation, this.quotationService);
              const resourceData = await resource.toArray();
              return this.sanitizeData(resourceData);
            } catch (error) {
              return {
                TIPO: this.getType(solicitation.type || ''),
                QUANTIDADE: solicitation.quantity || 0,
                STATUS: this.getStatus(solicitation.status),
                SOLICITANTE: solicitation.user?.name || 'N/A',
                EMAIL: solicitation.user?.email || 'N/A',
                TELEFONE: solicitation.user?.phone || 'N/A',
                CLIENTE: solicitation.client?.name || '',
                CNPJ: '',
                TOTAL: 'R$ 0,00',
                DATA: solicitation.createdAt ? new Date(solicitation.createdAt).toLocaleString('pt-BR') : 'N/A',
              };
            }
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
    if (data.length === 0) {
      throw new Error("Nenhum dado encontrado para exportação");
    }

    const sanitizedData = data.map(row => this.sanitizeData(row));
    const xlsxFilename = `${filename}.xlsx`;
    const filePath = path.join(process.cwd(), "public", "export", xlsxFilename);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(filename);

    const headers = Object.keys(sanitizedData[0]);
    
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 20,
    }));

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    sanitizedData.forEach((row) => {
      const rowData = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return "";
        }
        return value;
      });
      worksheet.addRow(rowData);
    });

    await workbook.xlsx.writeFile(filePath);

    return `/export/${xlsxFilename}`;
  }

  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = this.sanitizeValue(value);
    }
    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item));
    }

    if (typeof value === "object") {
      try {
        const seen = new WeakSet();
        const sanitized: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) {
          if (v != null && typeof v === "object") {
            if (seen.has(v)) {
              sanitized[k] = "[Circular]";
              continue;
            }
            seen.add(v);
          }
          sanitized[k] = this.sanitizeValue(v);
        }
        return sanitized;
      } catch (error) {
        return "[Erro ao sanitizar]";
      }
    }

    return String(value);
  }

  private getType(type: string): string {
    const types: Record<string, string> = {
      supplier_search: 'Busca por fornecedores',
      viability_study: 'Estudos de viabilidade',
    };
    return types[type] || 'Busca por fornecedores';
  }

  private getStatus(status: string): string {
    const statuses: Record<string, string> = {
      open: 'Novo',
      pending: 'Pendente',
      in_progress: 'Em andamento',
      finished: 'Finalizado',
    };
    return statuses[status] || 'Novo';
  }

  private safeStringify(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (typeof value === "object") {
      try {
        const seen = new WeakSet();
        return JSON.stringify(value, (key, val) => {
          if (val != null && typeof val === "object") {
            if (seen.has(val)) {
              return "[Circular]";
            }
            seen.add(val);
          }
          return val;
        });
      } catch (error) {
        return "[Erro ao serializar]";
      }
    }

    return String(value);
  }

  private async exportToPDF(
    filename: string,
    data: Record<string, any>[],
    params?: Record<string, any>
  ): Promise<string> {
    if (data.length === 0) {
      throw new Error("Nenhum dado encontrado para exportação");
    }

    const sanitizedData = data.map(row => this.sanitizeData(row));

    const pdfFilename = `${filename}.pdf`;
    const filePath = path.join(process.cwd(), "public", "export", pdfFilename);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fsSync.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(18).font("Helvetica-Bold").text(filename, { align: "center" });
      doc.moveDown();
      doc.fontSize(10).font("Helvetica").text(`Total de registros: ${sanitizedData.length}`, { align: "center" });
      doc.moveDown(2);

      const headers = Object.keys(sanitizedData[0]);
      const pageWidth = doc.page.width - 100;
      const columnWidth = Math.max(60, pageWidth / headers.length);
      let yPosition = doc.y;

      doc.fontSize(9).font("Helvetica-Bold");
      headers.forEach((header, index) => {
        const xPosition = 50 + index * columnWidth;
        doc.text(header, xPosition, yPosition, {
          width: columnWidth - 5,
          align: "left",
        });
      });

      yPosition += 15;
      doc.moveTo(50, yPosition).lineTo(doc.page.width - 50, yPosition).stroke();
      yPosition += 5;

      doc.font("Helvetica").fontSize(8);
      sanitizedData.forEach((row) => {
        if (yPosition > doc.page.height - 80) {
          doc.addPage();
          yPosition = 50;
          
          doc.fontSize(9).font("Helvetica-Bold");
          headers.forEach((header, index) => {
            const xPosition = 50 + index * columnWidth;
            doc.text(header, xPosition, yPosition, {
              width: columnWidth - 5,
              align: "left",
            });
          });
          yPosition += 15;
          doc.moveTo(50, yPosition).lineTo(doc.page.width - 50, yPosition).stroke();
          yPosition += 5;
          doc.font("Helvetica").fontSize(8);
        }

        let maxHeight = 0;
        headers.forEach((header, colIndex) => {
          const value = row[header];
          const cellValue = this.safeStringify(value);

          const xPosition = 50 + colIndex * columnWidth;
          const textHeight = doc.heightOfString(cellValue, {
            width: columnWidth - 5,
          });
          maxHeight = Math.max(maxHeight, textHeight);

          doc.text(cellValue, xPosition, yPosition, {
            width: columnWidth - 5,
            align: "left",
          });
        });

        yPosition += maxHeight + 8;
      });

      doc.end();

      stream.on("finish", () => {
        resolve(`/export/${pdfFilename}`);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    });
  }
}
