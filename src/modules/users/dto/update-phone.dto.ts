import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdatePhoneDto {
  @ApiProperty({
    example: '11999999999',
    description: 'Telefone do usuário',
  })
  @IsString()
  @IsNotEmpty()
  phone: string
}


