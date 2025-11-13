import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePlanDto {
  @ApiProperty({
    example: 'Plano Premium',
    description: 'Nome do plano',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: 'Plano completo com todos os recursos',
    description: 'Descrição do plano',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    example: 99.90,
    description: 'Preço do plano',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number

  @ApiPropertyOptional({
    example: { feature1: true, feature2: true, limit_requests: 1000 },
    description: 'Features do plano (JSON)',
  })
  @IsOptional()
  features?: any

  @ApiPropertyOptional({
    example: true,
    description: 'Se o plano está ativo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}


