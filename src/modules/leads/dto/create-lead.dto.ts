import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { LeadOrigin, LeadStatus } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateLeadDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do lead',
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

  @ApiProperty({
    example: 'WEBSITE',
    description: 'Origem do lead',
    enum: LeadOrigin,
  })
  @IsEnum(LeadOrigin)
  @IsNotEmpty()
  origin: LeadOrigin

  @ApiPropertyOptional({
    example: 'NEW',
    description: 'Status do lead',
    enum: LeadStatus,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus

  @ApiPropertyOptional({
    description: 'Dados adicionais',
  })
  @IsOptional()
  @IsObject()
  metadata?: any
}

