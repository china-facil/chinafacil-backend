import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { AdminActionType } from '@prisma/client'

export class FilterAdminLogDto {
  @ApiPropertyOptional({
    example: 'usuário',
    description: 'Buscar por texto (nome, email, recurso)',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: AdminActionType,
    description: 'Filtrar por tipo de ação',
  })
  @IsOptional()
  @IsEnum(AdminActionType)
  action?: AdminActionType

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Data inicial para filtro',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Data final para filtro',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Página atual',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Itens por página',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10
}

