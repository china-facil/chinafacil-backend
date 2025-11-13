import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ExportType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator'

export class RequestExportDto {
  @ApiProperty({
    example: 'EXCEL',
    description: 'Tipo de exportação',
    enum: ExportType,
  })
  @IsEnum(ExportType)
  @IsNotEmpty()
  type: ExportType

  @ApiPropertyOptional({
    description: 'Filtros e parâmetros',
  })
  @IsOptional()
  @IsObject()
  params?: any
}


