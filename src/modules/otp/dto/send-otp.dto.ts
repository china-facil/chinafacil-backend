import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendOTPDto {
  @ApiProperty({
    example: '+5511999999999',
    description: 'Telefone com código do país',
  })
  @IsString()
  @IsNotEmpty()
  phone: string
}

