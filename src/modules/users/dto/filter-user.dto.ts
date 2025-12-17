import { ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole, UserStatus } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Buscar por nome ou email',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus

  @ApiPropertyOptional({
    description: 'Filtrar por telefone verificado',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  phone_verified?: boolean

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

  @ApiPropertyOptional({
    description: 'Itens por página (alias)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  items_per_page?: number

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
}


