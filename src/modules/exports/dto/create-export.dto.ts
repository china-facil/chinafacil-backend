import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ExportStatus, ExportType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateExportDto {
  @ApiProperty({
    example: 'EXCEL',
    description: 'Tipo de exportação',
    enum: ExportType,
  })
  @IsEnum(ExportType)
  @IsNotEmpty()
  type: ExportType

  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiPropertyOptional({
    description: 'Parâmetros da exportação',
  })
  @IsOptional()
  @IsObject()
  params?: any

  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'Status da exportação',
    enum: ExportStatus,
  })
  @IsOptional()
  @IsEnum(ExportStatus)
  status?: ExportStatus
}


