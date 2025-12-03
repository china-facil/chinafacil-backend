import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { ExportStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { ExportsService } from '../../modules/exports/exports.service'
import { ProcessExportJobDto } from '../dto/export-job.dto'

@Processor('export-queue')
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name)

  constructor(
    private readonly exportsService: ExportsService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('process-export')
  async handleProcessExport(job: Job<ProcessExportJobDto>) {
    this.logger.log(`Processing export job ${job.id} for export ${job.data.exportId}`)

    const { exportId, userId, type, model, params } = job.data

    try {
      await this.exportsService.markAsProcessing(exportId)

      this.logger.log(`Starting export generation: ${exportId}, type: ${type}, model: ${model}`)

      let fileUrl: string

      switch (type) {
        case 'CSV':
          fileUrl = await this.exportToCSV(exportId, model, params)
          break
        case 'EXCEL':
          fileUrl = await this.exportToExcel(exportId, model, params)
          break
        case 'PDF':
          fileUrl = await this.exportToPDF(exportId, model, params)
          break
        case 'JSON':
          fileUrl = await this.exportToJSON(exportId, model, params)
          break
        default:
          throw new Error(`Unsupported export type: ${type}`)
      }

      await this.exportsService.markAsCompleted(exportId, fileUrl)

      this.logger.log(`Export completed successfully: ${exportId}, file: ${fileUrl}`)

      return {
        success: true,
        exportId,
        fileUrl,
      }
    } catch (error) {
      this.logger.error(
        `Failed to process export ${exportId}: ${error.message}`,
        error.stack,
      )

      await this.exportsService.markAsFailed(exportId)

      throw error
    }
  }

  private async exportToCSV(
    exportId: string,
    model: string,
    params?: Record<string, any>,
  ): Promise<string> {
    this.logger.log(`Generating CSV export for model: ${model}`)

    const data = await this.getDataForExport(model, params)

    if (!data || data.length === 0) {
      throw new Error('No data found for export')
    }

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            if (value === null || value === undefined) {
              return ''
            }
            if (typeof value === 'object') {
              return JSON.stringify(value).replace(/"/g, '""')
            }
            return String(value).replace(/"/g, '""')
          })
          .map((val) => `"${val}"`)
          .join(','),
      ),
    ]

    const csvContent = csvRows.join('\n')
    const filename = `export-${exportId}-${Date.now()}.csv`
    const filePath = `public/exports/${filename}`

    const fs = await import('fs/promises')
    const path = await import('path')

    const fullPath = path.join(process.cwd(), filePath)
    const dir = path.dirname(fullPath)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, csvContent, 'utf-8')

    return `/exports/${filename}`
  }

  private async exportToExcel(
    exportId: string,
    model: string,
    params?: Record<string, any>,
  ): Promise<string> {
    this.logger.log(`Generating Excel export for model: ${model}`)

    const data = await this.getDataForExport(model, params)

    if (!data || data.length === 0) {
      throw new Error('No data found for export')
    }

    this.logger.warn(
      'Excel export requires exceljs package. Falling back to CSV format.',
    )

    return this.exportToCSV(exportId, model, params)
  }

  private async exportToPDF(
    exportId: string,
    model: string,
    params?: Record<string, any>,
  ): Promise<string> {
    this.logger.log(`Generating PDF export for model: ${model}`)

    const data = await this.getDataForExport(model, params)

    if (!data || data.length === 0) {
      throw new Error('No data found for export')
    }

    this.logger.warn(
      'PDF export requires pdfkit package. Falling back to JSON format.',
    )

    return this.exportToJSON(exportId, model, params)
  }

  private async exportToJSON(
    exportId: string,
    model: string,
    params?: Record<string, any>,
  ): Promise<string> {
    this.logger.log(`Generating JSON export for model: ${model}`)

    const data = await this.getDataForExport(model, params)

    const filename = `export-${exportId}-${Date.now()}.json`
    const filePath = `public/exports/${filename}`
    const fullPath = require('path').join(process.cwd(), filePath)
    const dir = require('path').dirname(fullPath)

    const fs = await import('fs/promises')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8')

    return `/exports/${filename}`
  }

  private async getDataForExport(
    model: string,
    params?: Record<string, any>,
  ): Promise<any[]> {
    this.logger.log(`Fetching data for export, model: ${model}`)

    let data: any[] = []

    switch (model) {
      case 'User':
        data = await this.prisma.user.findMany({
          take: 500,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'Solicitation':
        data = await this.prisma.solicitation.findMany({
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
          },
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'Client':
        data = await this.prisma.client.findMany({
          take: 500,
          orderBy: { createdAt: 'desc' },
        })
        break
      default:
        throw new Error(`Unsupported model for export: ${model}`)
    }

    return data
  }
}

