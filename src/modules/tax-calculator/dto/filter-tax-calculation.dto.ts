import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterTaxCalculationDto {
  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'ID do usuário para filtrar',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    example: '84713010',
    description: 'Código NCM para filtrar',
  })
  @IsOptional()
  @IsString()
  ncmCode?: string

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data inicial (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Data final (ISO 8601)',
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
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20
}


