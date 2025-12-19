import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'

export class CreateTaxCalculationDto {
  @ApiPropertyOptional({ description: 'ID do usuário' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'user_id' })
  userId?: string

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'user_email' })
  userEmail?: string

  @ApiPropertyOptional({ description: 'ID temporário do usuário' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'temp_user_id' })
  tempUserId?: string

  @ApiProperty({ example: 'Produto Teste', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'product_name' })
  @Transform(({ obj }) => obj.product_name || obj.productName)
  productName: string

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'URL da imagem do produto' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'product_image_url' })
  @Transform(({ obj }) => obj.product_image_url || obj.productImageUrl)
  productImageUrl?: string

  @ApiPropertyOptional({ example: '84713010', description: 'Código NCM' })
  @IsOptional()
  @IsString()
  @Expose({ name: 'ncm_code' })
  @Transform(({ obj }) => obj.ncm_code || obj.ncmCode)
  ncmCode?: string

  @ApiProperty({ example: 0.1, description: 'Volume unitário' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'volume_un' })
  @Transform(({ obj }) => {
    const val = obj.volume_un ?? obj.volumeUn
    return val !== undefined ? Number(val) : undefined
  })
  volumeUn: number

  @ApiProperty({ example: 0.5, description: 'Peso unitário' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'weight_un' })
  @Transform(({ obj }) => {
    const val = obj.weight_un ?? obj.weightUn
    return val !== undefined ? Number(val) : undefined
  })
  weightUn: number

  @ApiProperty({ example: 1, description: 'Quantidade' })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => value !== undefined ? Number(value) : undefined)
  quantity: number

  @ApiProperty({ example: 100.0, description: 'Preço unitário em BRL' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'unit_price_brl' })
  @Transform(({ obj }) => {
    const val = obj.unit_price_brl ?? obj.unitPriceBrl
    return val !== undefined ? Number(val) : undefined
  })
  unitPriceBrl: number

  @ApiProperty({ example: 'BRL', description: 'Moeda', enum: ['BRL', 'USD'] })
  @IsEnum(['BRL', 'USD'])
  currency: string

  @ApiPropertyOptional({ example: 80.0, description: 'Preço unitário original' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'unit_price_original' })
  @Transform(({ obj }) => {
    const val = obj.unit_price_original ?? obj.unitPriceOriginal
    return val !== undefined ? Number(val) : undefined
  })
  unitPriceOriginal?: number

  @ApiPropertyOptional({ example: 7.2, description: 'Taxa do Yuan' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'yuan_rate' })
  @Transform(({ obj }) => {
    const val = obj.yuan_rate ?? obj.yuanRate
    return val !== undefined ? Number(val) : undefined
  })
  yuanRate?: number

  @ApiPropertyOptional({ example: 5.0, description: 'Taxa do Dólar' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'dolar_rate' })
  @Transform(({ obj }) => {
    const val = obj.dolar_rate ?? obj.dolarRate
    return val !== undefined ? Number(val) : undefined
  })
  dolarRate?: number

  @ApiPropertyOptional({ example: 100.5, description: 'Distância em KM' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'distance_km' })
  @Transform(({ obj }) => {
    const val = obj.distance_km ?? obj.distanceKm
    return val !== undefined ? Number(val) : undefined
  })
  distanceKm?: number

  @ApiProperty({ example: 'unitario', description: 'Tipo de volume', enum: ['unitario', 'total'] })
  @IsEnum(['unitario', 'total'])
  @Expose({ name: 'volume_type' })
  @Transform(({ obj }) => obj.volume_type || obj.volumeType)
  volumeType: string

  @ApiProperty({ example: 'unitario', description: 'Tipo de peso', enum: ['unitario', 'total'] })
  @IsEnum(['unitario', 'total'])
  @Expose({ name: 'weight_type' })
  @Transform(({ obj }) => obj.weight_type || obj.weightType)
  weightType: string

  @ApiProperty({ example: 0.1, description: 'Volume total' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'total_volume' })
  @Transform(({ obj }) => {
    const val = obj.total_volume ?? obj.totalVolume
    return val !== undefined ? Number(val) : undefined
  })
  totalVolume: number

  @ApiProperty({ example: 0.5, description: 'Peso total' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'total_weight' })
  @Transform(({ obj }) => {
    const val = obj.total_weight ?? obj.totalWeight
    return val !== undefined ? Number(val) : undefined
  })
  totalWeight: number

  @ApiProperty({ example: 80.0, description: 'Preço do fornecedor' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'supplier_price' })
  @Transform(({ obj }) => {
    const val = obj.supplier_price ?? obj.supplierPrice
    return val !== undefined ? Number(val) : undefined
  })
  supplierPrice: number

  @ApiProperty({ example: 100.0, description: 'Custo total' })
  @IsNumber()
  @Min(0)
  @Expose({ name: 'total_cost' })
  @Transform(({ obj }) => {
    const val = obj.total_cost ?? obj.totalCost
    return val !== undefined ? Number(val) : undefined
  })
  totalCost: number

  @ApiPropertyOptional({ description: 'Detalhamento do cálculo (JSON)' })
  @IsOptional()
  @IsObject()
  @Expose({ name: 'calculation_breakdown' })
  @Transform(({ obj }) => obj.calculation_breakdown || obj.calculationBreakdown)
  calculationBreakdown?: any
}
