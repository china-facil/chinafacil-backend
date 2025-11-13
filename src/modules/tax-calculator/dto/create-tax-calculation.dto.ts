import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateTaxCalculationDto {
  @ApiPropertyOptional({
    description: 'ID do usuário',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiProperty({
    description: 'Dados do produto (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  productData: any

  @ApiPropertyOptional({
    example: '84713010',
    description: 'Código NCM',
  })
  @IsOptional()
  @IsString()
  ncmCode?: string

  @ApiProperty({
    description: 'Resultado do cálculo (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  calculationResult: any
}


