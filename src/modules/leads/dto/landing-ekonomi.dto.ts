import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class LandingEkonomiDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do lead',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  nome: string

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  telefone: string

  @ApiPropertyOptional({
    example: 'google',
    description: 'UTM Source',
  })
  @IsOptional()
  @IsString()
  utm_source?: string

  @ApiPropertyOptional({
    example: 'cpc',
    description: 'UTM Medium',
  })
  @IsOptional()
  @IsString()
  utm_medium?: string

  @ApiPropertyOptional({
    example: 'campanha-verao',
    description: 'UTM Campaign',
  })
  @IsOptional()
  @IsString()
  utm_campaign?: string

  @ApiPropertyOptional({
    example: 'keyword',
    description: 'UTM Term',
  })
  @IsOptional()
  @IsString()
  utm_term?: string

  @ApiPropertyOptional({
    example: 'banner-topo',
    description: 'UTM Content',
  })
  @IsOptional()
  @IsString()
  utm_content?: string

  @ApiPropertyOptional({
    example: 'gclid123',
    description: 'Google Click ID',
  })
  @IsOptional()
  @IsString()
  gclid?: string

  @ApiPropertyOptional({
    example: 'fbclid123',
    description: 'Facebook Click ID',
  })
  @IsOptional()
  @IsString()
  fbclid?: string
}
