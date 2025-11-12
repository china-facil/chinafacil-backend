import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SubscriptionStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

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
    default: SubscriptionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Data de início da assinatura',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Data de expiração da assinatura',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}

