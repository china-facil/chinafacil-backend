import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class EmbeddingDto {
  @ApiProperty({
    example: 'Texto para gerar embedding',
    description: 'Texto a ser convertido em embedding',
  })
  @IsString()
  @IsNotEmpty()
  text: string
}
