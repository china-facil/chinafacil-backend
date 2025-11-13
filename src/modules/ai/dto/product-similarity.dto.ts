import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject } from 'class-validator'

export class ProductSimilarityDto {
  @ApiProperty({
    description: 'Produto do Mercado Livre',
  })
  @IsObject()
  @IsNotEmpty()
  mercadoLivreProduct: any

  @ApiProperty({
    description: 'Produto da China',
  })
  @IsObject()
  @IsNotEmpty()
  chinaProduct: any
}


