import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateBoardingTypeDto {
  @ApiProperty({
    example: 'Marítimo',
    description: 'Nome do tipo de embarque',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: 'Embarque por via marítima',
    description: 'Descrição',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    example: 1500.50,
    description: 'Despesas no Brasil',
  })
  @IsOptional()
  @IsNumber()
  brazilExpenses?: number

  @ApiPropertyOptional({
    example: true,
    description: 'Se está ativo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

