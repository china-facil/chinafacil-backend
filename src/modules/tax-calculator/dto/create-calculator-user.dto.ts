import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCalculatorUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone',
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    example: 'Empresa LTDA',
    description: 'Empresa',
  })
  @IsOptional()
  @IsString()
  company?: string
}

