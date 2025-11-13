import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class TranslateTextDto {
  @ApiProperty({
    example: 'Hello world',
    description: 'Texto a ser traduzido',
  })
  @IsString()
  @IsNotEmpty()
  text: string

  @ApiProperty({
    example: 'pt',
    description: 'Idioma de destino',
  })
  @IsString()
  @IsNotEmpty()
  to: string

  @ApiPropertyOptional({
    example: 'en',
    description: 'Idioma de origem',
  })
  @IsOptional()
  @IsString()
  from?: string

  @ApiPropertyOptional({
    example: 'google',
    description: 'Provider (google ou azure)',
  })
  @IsOptional()
  @IsString()
  provider?: string
}


