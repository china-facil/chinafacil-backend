import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole, UserStatus } from '@prisma/client'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone do usuário',
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL do avatar',
  })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.user,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({
    enum: UserStatus,
    default: UserStatus.active,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus

  @ApiPropertyOptional({
    example: '1-5',
    description: 'Número de funcionários (pode ser range como "1-5")',
  })
  @IsOptional()
  @IsString()
  employees?: string

  @ApiPropertyOptional({
    example: '50000',
    description: 'Faturamento mensal',
  })
  @IsOptional()
  @IsString()
  monthlyBilling?: string

  @ApiPropertyOptional({
    example: '12345678000190',
    description: 'CNPJ da empresa',
  })
  @IsOptional()
  @IsString()
  cnpj?: string

  @ApiPropertyOptional({
    example: { razao_social: 'Empresa LTDA', fantasia: 'Empresa' },
    description: 'Dados da empresa (JSON)',
  })
  @IsOptional()
  companyData?: any
}


