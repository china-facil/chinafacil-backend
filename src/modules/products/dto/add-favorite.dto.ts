import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class AddFavoriteDto {
  @ApiProperty({
    example: 'product-123',
    description: 'ID do produto',
  })
  @IsString()
  @IsNotEmpty()
  productId: string

  @ApiProperty({
    example: {
      title: 'Produto exemplo',
      price: 99.99,
      image: 'https://example.com/image.jpg',
    },
    description: 'Dados do produto (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  productData: any
}


