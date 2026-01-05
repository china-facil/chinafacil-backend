import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'

export class CreateTaxCalculationDto {
  @ApiPropertyOptional({
    example: 'user-uuid',
    description: 'ID do usuário',
  })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({
    example: 'usuario@example.com',
    description: 'Email do usuário',
  })
  @IsOptional()
  @IsString()
  userEmail?: string

  @ApiPropertyOptional({
    example: 'temp-user-123',
    description: 'ID temporário do usuário (para usuários não cadastrados)',
  })
  @IsOptional()
  @IsString()
  tempUserId?: string

  @ApiProperty({
    example: 'Produto Teste',
    description: 'Nome do produto',
  })
  @IsString()
  @IsNotEmpty()
  productName: string

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL da imagem do produto',
  })
  @IsOptional()
  @IsString()
  productImageUrl?: string

  @ApiPropertyOptional({
    example: '84713010',
    description: 'Código NCM',
  })
  @IsOptional()
  @IsString()
  ncmCode?: string

  @ApiProperty({
    example: 0.1,
    description: 'Volume unitário',
  })
  @IsNumber()
  @Min(0)
  volumeUn: number

  @ApiProperty({
    example: 0.5,
    description: 'Peso unitário',
  })
  @IsNumber()
  @Min(0)
  weightUn: number

  @ApiProperty({
    example: 1,
    description: 'Quantidade',
  })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({
    example: 100.0,
    description: 'Preço unitário em BRL',
  })
  @IsNumber()
  @Min(0)
  unitPriceBrl: number

  @ApiProperty({
    example: 'BRL',
    description: 'Moeda',
    enum: ['BRL', 'USD'],
  })
  @IsEnum(['BRL', 'USD'])
  currency: string

  @ApiPropertyOptional({
    example: 80.0,
    description: 'Preço unitário original',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPriceOriginal?: number

  @ApiPropertyOptional({
    example: 7.2,
    description: 'Taxa do Yuan',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yuanRate?: number

  @ApiPropertyOptional({
    example: 5.0,
    description: 'Taxa do Dólar',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dolarRate?: number

  @ApiPropertyOptional({
    example: 100.5,
    description: 'Distância em KM',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number

  @ApiProperty({
    example: 'unitario',
    description: 'Tipo de volume',
    enum: ['unitario', 'total'],
  })
  @IsEnum(['unitario', 'total'])
  volumeType: string

  @ApiProperty({
    example: 'unitario',
    description: 'Tipo de peso',
    enum: ['unitario', 'total'],
  })
  @IsEnum(['unitario', 'total'])
  weightType: string

  @ApiProperty({
    example: 0.1,
    description: 'Volume total',
  })
  @IsNumber()
  @Min(0)
  totalVolume: number

  @ApiProperty({
    example: 0.5,
    description: 'Peso total',
  })
  @IsNumber()
  @Min(0)
  totalWeight: number

  @ApiProperty({
    example: 80.0,
    description: 'Preço do fornecedor',
  })
  @IsNumber()
  @Min(0)
  supplierPrice: number

  @ApiProperty({
    example: 100.0,
    description: 'Custo total',
  })
  @IsNumber()
  @Min(0)
  totalCost: number

  @ApiPropertyOptional({
    description: 'Detalhamento do cálculo (JSON)',
  })
  @IsOptional()
  @IsObject()
  calculationBreakdown?: any
}
