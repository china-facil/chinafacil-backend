import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CalculateFreightDto {
  @ApiProperty({
    example: 'São Paulo',
    description: 'Origem do frete (cidade)',
  })
  @IsNotEmpty()
  @IsString()
  origin: string

  @ApiProperty({
    example: 'Rio de Janeiro',
    description: 'Destino do frete (cidade)',
  })
  @IsNotEmpty()
  @IsString()
  destination: string

  @ApiProperty({
    example: 5000,
    description: 'Peso em gramas',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weight: number

  @ApiPropertyOptional({
    example: 10000,
    description: 'Volume em cm³',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number

  @ApiPropertyOptional({
    example: 1000.00,
    description: 'Valor CIF para cálculo de GRIS',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cifValue?: number

  @ApiPropertyOptional({
    example: 450,
    description: 'Distância em km (opcional)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number
}




