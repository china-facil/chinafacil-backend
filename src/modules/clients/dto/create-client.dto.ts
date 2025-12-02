import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateClientDto {
  @ApiProperty({
    example: 'Empresa XYZ LTDA',
    description: 'Nome do cliente',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: 99.90,
    description: 'Preço do plano',
  })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de buscas de fornecedor',
  })
  @IsOptional()
  @IsNumber()
  supplierSearch?: number

  @ApiPropertyOptional({
    example: 5,
    description: 'Quantidade de estudos de viabilidade',
  })
  @IsOptional()
  @IsNumber()
  viabilityStudy?: number

  @ApiPropertyOptional({
    example: 'active',
    description: 'Status do plano',
  })
  @IsOptional()
  @IsString()
  planStatus?: string
}
