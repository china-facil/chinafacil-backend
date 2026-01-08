import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateCartDto {
  @ApiProperty({
    example: [
      {
        productId: 'prod-123',
        quantity: 2,
        price: 99.99,
      },
    ],
    description: 'Itens do carrinho (array de objetos)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  items: any[]

  @ApiPropertyOptional({
    example: {
      subtotal: 199.98,
      shipping: 50.00,
      total: 249.98,
    },
    description: 'Dados de precificação (objeto JSON)',
  })
  @IsOptional()
  @IsObject()
  pricingData?: any

  @ApiPropertyOptional({
    example: 'solicitation-uuid',
    description: 'ID da solicitação relacionada',
  })
  @IsOptional()
  @IsString()
  solicitationId?: string
}


