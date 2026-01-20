import { ApiPropertyOptional } from '@nestjs/swagger'
import { SolicitationStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterSolicitationDto {
  @ApiPropertyOptional({
    example: 'SOL-2024-001',
    description: 'Buscar por código da solicitação',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: SolicitationStatus,
    example: SolicitationStatus.open,
    description: 'Filtrar por status',
  })
  @IsOptional()
  @IsEnum(SolicitationStatus)
  status?: SolicitationStatus

  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'Filtrar por ID do usuário',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    example: 'client-uuid',
    description: 'Filtrar por ID do cliente',
  })
  @IsOptional()
  @IsString()
  clientId?: string

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Número da página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    example: 10,
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

  @ApiPropertyOptional({
    description: 'Data inicial',
  })
  @IsOptional()
  @IsString()
  date_start?: string

  @ApiPropertyOptional({
    description: 'Data final',
  })
  @IsOptional()
  @IsString()
  date_end?: string

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'

  @ApiPropertyOptional({
    description: 'Campo de ordenação',
  })
  @IsOptional()
  @IsString()
  'order-key'?: string

  @ApiPropertyOptional({
    description: 'Direção de ordenação',
  })
  @IsOptional()
  @IsString()
  order?: string
}


