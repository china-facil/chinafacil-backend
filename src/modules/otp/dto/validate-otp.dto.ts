import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ValidateOTPDto {
  @ApiProperty({
    example: '+5511999999999',
    description: 'Telefone com código do país',
  })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({
    example: '123456',
    description: 'Código OTP de 6 dígitos',
  })
  @IsString()
  @IsNotEmpty()
  code: string
}

