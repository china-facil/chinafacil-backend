import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone do usuário',
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    example: '12345678000190',
    description: 'CNPJ da empresa',
  })
  @IsOptional()
  @IsString()
  cnpj?: string

  @ApiPropertyOptional({
    example: { razao_social: 'Empresa LTDA', fantasia: 'Empresa' },
    description: 'Dados da empresa',
  })
  @IsOptional()
  companyData?: any

  @ApiPropertyOptional({
    example: 'seller-uuid',
    description: 'ID do vendedor que atendeu o cliente',
  })
  @IsOptional()
  @IsString()
  sellerId?: string
}

