import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserAddressDto {
  @ApiProperty({ description: 'Rua' })
  @IsNotEmpty({ message: 'Rua é obrigatório' })
  @IsString()
  street: string

  @ApiProperty({ description: 'Número' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @IsString()
  number: string

  @ApiProperty({ description: 'Complemento', required: false })
  @IsOptional()
  @IsString()
  complement?: string

  @ApiProperty({ description: 'Bairro' })
  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  @IsString()
  neighborhood: string

  @ApiProperty({ description: 'Cidade' })
  @IsNotEmpty({ message: 'Cidade é obrigatório' })
  @IsString()
  city: string

  @ApiProperty({ description: 'Estado' })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  state: string

  @ApiProperty({ description: 'CEP' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString()
  zipCode: string

  @ApiProperty({ description: 'País', default: 'Brasil', required: false })
  @IsOptional()
  @IsString()
  country?: string
}


