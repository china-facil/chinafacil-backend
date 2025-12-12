import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class TranslateTextDto {
  @ApiProperty({
    example: '东莞市大岭山欣远胜电子配件商行',
    description: 'Texto a ser traduzido',
  })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiPropertyOptional({
    example: 'pt',
    description: 'Idioma de destino (padrão: pt)',
    default: 'pt',
  })
  @IsOptional()
  @IsString()
  to?: string

  @ApiPropertyOptional({
    example: 'zh-CN',
    description: 'Idioma de origem (padrão: zh-CN)',
    default: 'zh-CN',
  })
  @IsOptional()
  @IsString()
  from?: string

  @ApiPropertyOptional({
    example: 'google',
    description: 'Provider de tradução (google)',
  })
  @IsOptional()
  @IsString()
  provider?: string
}


