import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AddFavoriteDto {
  @ApiProperty({
    example: '869816126705',
    description: 'ID do produto (alb- para Alibaba, numérico para 1688)',
  })
  @IsString()
  @IsNotEmpty()
  productId: string
}
