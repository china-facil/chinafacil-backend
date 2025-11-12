import { Injectable, NotFoundException } from '@nestjs/common'
import { ExportStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { CreateExportDto, RequestExportDto } from './dto'

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExportDto: CreateExportDto) {
    const exportRecord = await this.prisma.export.create({
      data: {
        ...createExportDto,
        status: ExportStatus.PENDING,
      },
    })

    return exportRecord
  }

  async requestExport(userId: string, requestExportDto: RequestExportDto) {
    const exportRecord = await this.create({
      type: requestExportDto.type,
      userId,
      params: requestExportDto.params,
      status: ExportStatus.PENDING,
    })

    return exportRecord
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {}

    const exports = await this.prisma.export.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return exports
  }

  async findOne(id: string) {
    const exportRecord = await this.prisma.export.findUnique({
      where: { id },
    })

    if (!exportRecord) {
      throw new NotFoundException('Exportação não encontrada')
    }

    return exportRecord
  }

  async updateStatus(id: string, status: ExportStatus, filePath?: string) {
    const exportRecord = await this.findOne(id)

    const updatedExport = await this.prisma.export.update({
      where: { id },
      data: {
        status,
        filePath,
        completedAt: status === ExportStatus.COMPLETED ? new Date() : null,
      },
    })

    return updatedExport
  }

  async markAsProcessing(id: string) {
    return this.updateStatus(id, ExportStatus.PROCESSING)
  }

  async markAsCompleted(id: string, filePath: string) {
    return this.updateStatus(id, ExportStatus.COMPLETED, filePath)
  }

  async markAsFailed(id: string) {
    return this.updateStatus(id, ExportStatus.FAILED)
  }

  async delete(id: string) {
    const exportRecord = await this.findOne(id)

    await this.prisma.export.delete({
      where: { id },
    })

    return {
      message: 'Exportação removida com sucesso',
    }
  }

  async getPendingExports() {
    const exports = await this.prisma.export.findMany({
      where: {
        status: ExportStatus.PENDING,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return exports
  }
}

