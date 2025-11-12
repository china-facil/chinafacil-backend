import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class TranslateProductDto {
  @ApiProperty({
    description: 'Produto a ser traduzido',
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

