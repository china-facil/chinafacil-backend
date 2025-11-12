import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de reset de senha',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string

  @ApiProperty({
    description: 'Nova senha',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string
}

