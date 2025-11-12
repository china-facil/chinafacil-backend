import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator'
import { ProductSortOrder } from './search-products.dto'

export class SearchByImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL da imagem para busca',
  })
  @IsString()
  @IsUrl()
  imgUrl: string

  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    example: 20,
    description: 'Itens por página',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 20

  @ApiPropertyOptional({
    enum: ProductSortOrder,
    default: ProductSortOrder.DEFAULT,
  })
  @IsOptional()
  @IsEnum(ProductSortOrder)
  sort?: ProductSortOrder = ProductSortOrder.DEFAULT

  @ApiPropertyOptional({
    example: 100,
    description: 'Preço mínimo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceStart?: number

  @ApiPropertyOptional({
    example: 1000,
    description: 'Preço máximo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceEnd?: number
}

