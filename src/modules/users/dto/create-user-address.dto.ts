import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserAddressDto {
  @ApiProperty({
    example: 'Rua das Flores',
    description: 'Rua',
  })
  @IsNotEmpty({ message: 'Rua é obrigatório' })
  @IsString()
  street: string

  @ApiProperty({
    example: '123',
    description: 'Número',
  })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @IsString()
  number: string

  @ApiProperty({
    example: 'Apto 45',
    description: 'Complemento',
    required: false,
  })
  @IsOptional()
  @IsString()
  complement?: string

  @ApiProperty({
    example: 'Centro',
    description: 'Bairro',
  })
  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  @IsString()
  neighborhood: string

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade',
  })
  @IsNotEmpty({ message: 'Cidade é obrigatório' })
  @IsString()
  city: string

  @ApiProperty({
    example: 'SP',
    description: 'Estado',
  })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  state: string

  @ApiProperty({
    example: '01234-567',
    description: 'CEP',
  })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString()
  postalCode: string
}



