import { ApiPropertyOptional } from '@nestjs/swagger'
import { SolicitationStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterSolicitationDto {
  @ApiPropertyOptional({
    description: 'Buscar por código',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: SolicitationStatus,
  })
  @IsOptional()
  @IsEnum(SolicitationStatus)
  status?: SolicitationStatus

  @ApiPropertyOptional({
    description: 'Filtrar por usuário',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    description: 'Filtrar por cliente',
  })
  @IsOptional()
  @IsString()
  clientId?: string

  @ApiPropertyOptional({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    default: 10,
    description: 'Número de itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10

  @ApiPropertyOptional({
    default: 10,
    description: 'Alias para limit - número de itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  items_per_page?: number
}


