import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator'

export class FilterNotificationDto {
  @ApiPropertyOptional({
    example: false,
    description: 'Filtrar por lidas (true) ou não lidas (false)',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  read?: boolean

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
    example: 20,
    default: 20,
    description: 'Itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20
}


