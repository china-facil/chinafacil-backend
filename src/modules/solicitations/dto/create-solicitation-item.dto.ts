import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateSolicitationItemDto {
  @ApiProperty({
    description: 'Dados do produto (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  productData: any

  @ApiProperty({
    example: 10,
    description: 'Quantidade',
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number

  @ApiPropertyOptional({
    example: 99.90,
    description: 'Preço unitário',
  })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiPropertyOptional({
    example: 'pending',
    description: 'Status do item',
  })
  @IsOptional()
  @IsString()
  status?: string
}


