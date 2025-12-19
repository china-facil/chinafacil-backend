import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class GetCbmDto {
  @ApiProperty({
    example: ['Produto 1', 'Produto 2'],
    description: 'Lista de nomes/termos dos produtos',
  })
  @IsArray()
  @IsNotEmpty()
  terms: string[]

  @ApiPropertyOptional({
    description: 'Lista de objetos completos dos produtos (opcional)',
  })
  @IsOptional()
  @IsArray()
  products?: any[]
}

export class GetCbmIndividualDto {
  @ApiProperty({
    example: 'Caixa de Som Bluetooth',
    description: 'Nome/termo do produto',
  })
  @IsString()
  @IsNotEmpty()
  term: string

  @ApiPropertyOptional({
    description: 'Objeto completo do produto (opcional)',
  })
  @IsOptional()
  @IsObject()
  product?: any
}



