import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject } from 'class-validator'

export class ProductSimilarityDto {
  @ApiProperty({
    example: {
      id: 'ML123456',
      title: 'Produto Mercado Livre',
      price: 199.99,
    },
    description: 'Produto do Mercado Livre (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  mercadoLivreProduct: any

  @ApiProperty({
    example: {
      id: 'item-123',
      title: 'Produto China',
      price: 99.99,
    },
    description: 'Produto da China (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  chinaProduct: any
}


