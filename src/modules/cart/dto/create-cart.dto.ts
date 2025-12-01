import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateCartDto {
  @ApiProperty({
    description: 'Itens do carrinho (JSON)',
  })
  @IsObject()
  @IsNotEmpty()
  items: any

  @ApiPropertyOptional({
    description: 'Dados de precificação (JSON)',
  })
  @IsOptional()
  @IsObject()
  pricingData?: any

  @ApiPropertyOptional({
    description: 'ID da solicitação',
  })
  @IsOptional()
  @IsString()
  solicitationId?: string
}


