import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SellerStatus } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateSellerDto {
  @ApiProperty({
    example: 'user-uuid',
    description: 'ID do usuário que será o vendedor',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do vendedor',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do vendedor',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiPropertyOptional({
    enum: SellerStatus,
    default: SellerStatus.active,
    description: 'Status do vendedor',
  })
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus
}

