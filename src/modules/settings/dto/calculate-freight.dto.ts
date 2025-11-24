import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CalculateFreightDto {
  @ApiProperty({ description: 'Origem do frete' })
  @IsNotEmpty()
  @IsString()
  origin: string

  @ApiProperty({ description: 'Destino do frete' })
  @IsNotEmpty()
  @IsString()
  destination: string

  @ApiProperty({ description: 'Peso em gramas' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weight: number

  @ApiPropertyOptional({ description: 'Volume em cm³' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number

  @ApiPropertyOptional({ description: 'Valor CIF para cálculo de GRIS' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cifValue?: number

  @ApiPropertyOptional({ description: 'Distância em km (opcional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number
}




