import { IsBoolean, IsInt, IsOptional, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

class CarouselSlideDto {
  @ApiProperty({ description: 'URL da imagem do slide' })
  imageUrl: string

  @ApiProperty({ description: 'URL de destino ao clicar no slide', required: false })
  linkUrl?: string

  @ApiProperty({ description: 'Texto alternativo da imagem', required: false })
  altText?: string
}

export class UpdateHomepageCarouselFlagDto {
  @ApiProperty({ description: 'Status ativo/inativo da flag', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ description: 'Array de slides do carrossel', required: false, type: [CarouselSlideDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarouselSlideDto)
  slides?: CarouselSlideDto[]

  @ApiProperty({ description: 'Ordem de exibição', required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}
