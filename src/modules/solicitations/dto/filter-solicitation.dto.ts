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
    description: 'Itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10
}


