import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class FilterLeadDto {
  @ApiPropertyOptional({
    example: 'João Silva',
    description: 'Buscar por nome, email ou telefone',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Número da página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10
}


