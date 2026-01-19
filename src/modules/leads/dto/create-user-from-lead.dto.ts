import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateUserFromLeadDto {
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
    example: '12345678000190',
    description: 'CNPJ da empresa',
  })
  @IsOptional()
  @IsString()
  cnpj?: string

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone do usuário',
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    example: '50000',
    description: 'Faturamento mensal',
  })
  @IsOptional()
  @IsString()
  monthlyBilling?: string

  @ApiPropertyOptional({
    example: '1-5',
    description: 'Número de funcionários (pode ser range como "1-5")',
  })
  @IsOptional()
  @IsString()
  employees?: string
}

