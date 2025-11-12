import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateCartDto {
  @ApiProperty({
    description: 'Itens do carrinho (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  items: any

  @ApiProperty({
    example: 1000,
    description: 'Subtotal',
  })
  @IsNumber()
  @IsNotEmpty()
  subtotal: number

  @ApiProperty({
    example: 200,
    description: 'Custo de frete',
  })
  @IsNumber()
  @IsNotEmpty()
  shippingCost: number

  @ApiProperty({
    example: 150,
    description: 'Impostos',
  })
  @IsNumber()
  @IsNotEmpty()
  tax: number

  @ApiProperty({
    example: 1350,
    description: 'Total',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number

  @ApiPropertyOptional({
    description: 'Dados de precificação (JSON)',
  })
  @IsOptional()
  @IsObject()
  pricingData?: any

  @ApiPropertyOptional({
    description: 'ID da solicitação',
  })
  @IsOptional()
  @IsString()
  solicitationId?: string
}

