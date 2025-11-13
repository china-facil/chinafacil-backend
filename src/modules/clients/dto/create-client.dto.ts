import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateClientDto {
  @ApiProperty({
    example: 'Empresa XYZ LTDA',
    description: 'Nome do cliente',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: 'contato@empresaxyz.com',
    description: 'Email do cliente',
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({
    example: 'CF-2024-001',
    description: 'Código CF do cliente',
  })
  @IsOptional()
  @IsString()
  cfCode?: string

  @ApiPropertyOptional({
    example: 'active',
    description: 'Status do plano',
  })
  @IsOptional()
  @IsString()
  planStatus?: string

  @ApiPropertyOptional({
    example: { razao_social: 'Empresa XYZ LTDA', cnpj: '12345678000190' },
    description: 'Dados da empresa (JSON)',
  })
  @IsOptional()
  companyData?: any
}


