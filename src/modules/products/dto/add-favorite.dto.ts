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
    description: 'Dados do produto (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  productData: any
}

