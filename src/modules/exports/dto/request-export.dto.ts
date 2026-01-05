import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export enum ExportType {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

export class RequestExportDto {
  @ApiProperty({
    example: 'xlsx',
    description: 'Tipo de exportação',
    enum: ExportType,
  })
  @IsEnum(ExportType)
  @IsNotEmpty()
  type: ExportType

  @ApiProperty({
    example: 'User',
    description: 'Modelo a ser exportado (User, Solicitation, Plan)',
  })
  @IsString()
  @IsNotEmpty()
  model: string

  @ApiPropertyOptional({
    example: {
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    description: 'Filtros e parâmetros para a exportação (objeto JSON)',
  })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>
}
