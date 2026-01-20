import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateOtProductsFlagDto {
  @ApiProperty({ description: 'Status ativo/inativo da flag', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ description: 'Quantidade de produtos retornados por página', required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number
}
