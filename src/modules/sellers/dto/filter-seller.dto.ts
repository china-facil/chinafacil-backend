import { ApiPropertyOptional } from '@nestjs/swagger'
import { SellerStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterSellerDto {
  @ApiPropertyOptional({
    example: 'João',
    description: 'Buscar por nome ou email do vendedor',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: SellerStatus,
    description: 'Filtrar por status',
  })
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus

  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'Filtrar por ID do usuário vinculado',
  })
  @IsOptional()
  @IsString()
  userId?: string

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

