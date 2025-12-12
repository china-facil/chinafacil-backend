import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Token de reset de senha',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string

  @ApiProperty({
    example: 'novaSenha123',
    description: 'Nova senha (mínimo 6 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string
}

