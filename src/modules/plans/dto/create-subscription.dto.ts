import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SubscriptionStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateSubscriptionDto {
  @ApiProperty({
    example: 'user-uuid',
    description: 'ID do usuário',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    example: 'plan-uuid',
    description: 'ID do plano',
  })
  @IsString()
  @IsNotEmpty()
  planId: string

  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.active,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Data de início do período atual',
  })
  @IsOptional()
  @IsDateString()
  currentPeriodStart?: string

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Data de fim do período atual',
  })
  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string

  @ApiPropertyOptional({
    example: 100.00,
    description: 'Preço da assinatura',
  })
  @IsOptional()
  price?: number

  @ApiPropertyOptional({
    example: 5,
    description: 'Quantidade de buscas de fornecedor',
  })
  @IsOptional()
  @IsInt()
  supplierSearch?: number

  @ApiPropertyOptional({
    example: 9999,
    description: 'Quantidade de estudos de viabilidade',
  })
  @IsOptional()
  @IsInt()
  viabilityStudy?: number
}


