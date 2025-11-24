import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterTaxCalculationDto {
  @ApiPropertyOptional({
    description: 'ID do usuário para filtrar',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    description: 'Código NCM para filtrar',
  })
  @IsOptional()
  @IsString()
  ncmCode?: string

  @ApiPropertyOptional({
    description: 'Data inicial (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
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


