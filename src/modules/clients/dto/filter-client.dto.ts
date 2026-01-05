import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterClientDto {
  @ApiPropertyOptional({
    example: 'Empresa XYZ',
    description: 'Buscar por nome do cliente',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filtrar por status do plano (active, inactive, etc)',
  })
  @IsOptional()
  @IsString()
  planStatus?: string

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
