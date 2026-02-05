import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateSellerDto {
  @ApiPropertyOptional({
    example: 'seller-uuid',
    description: 'ID do vendedor que atendeu o cliente (null para remover vínculo)',
  })
  @IsOptional()
  @IsString()
  sellerId?: string | null
}

