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
    description: 'Filtros e parâmetros',
  })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>
}
