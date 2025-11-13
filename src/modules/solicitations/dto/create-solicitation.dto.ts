import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SolicitationStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateSolicitationDto {
  @ApiProperty({
    example: 'user-uuid',
    description: 'ID do usuário',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiPropertyOptional({
    example: 'client-uuid',
    description: 'ID do cliente',
  })
  @IsOptional()
  @IsString()
  clientId?: string

  @ApiPropertyOptional({
    example: 'cotacao',
    description: 'Tipo da solicitação',
  })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({
    enum: SolicitationStatus,
    default: SolicitationStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(SolicitationStatus)
  status?: SolicitationStatus

  @ApiPropertyOptional({
    example: 100,
    description: 'Quantidade de itens',
  })
  @IsOptional()
  @IsNumber()
  quantity?: number
}


