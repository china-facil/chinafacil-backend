import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class TranslateProductDto {
  @ApiProperty({
    example: {
      title: '产品名称',
      description: '产品描述',
      price: 99.99,
    },
    description: 'Produto a ser traduzido (objeto JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  product: any

  @ApiPropertyOptional({
    example: 'pt',
    description: 'Idioma de destino',
  })
  @IsOptional()
  @IsString()
  to?: string

  @ApiPropertyOptional({
    example: 'zh',
    description: 'Idioma de origem',
  })
  @IsOptional()
  @IsString()
  from?: string
}


