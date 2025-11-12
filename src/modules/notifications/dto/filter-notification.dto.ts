import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator'

export class FilterNotificationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por lidas/não lidas',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  read?: boolean

  @ApiPropertyOptional({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20
}

