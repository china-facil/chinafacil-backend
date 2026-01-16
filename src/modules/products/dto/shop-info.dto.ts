import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ShopInfoDto {
  @ApiProperty({
    example: '123456789',
    description: 'ID do vendedor (member_id)',
  })
  @IsString()
  memberId: string
}
