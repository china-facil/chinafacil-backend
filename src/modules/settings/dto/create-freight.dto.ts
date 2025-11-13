import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateFreightDto {
  @ApiProperty({
    example: 'Guangzhou',
    description: 'Origem',
  })
  @IsString()
  @IsNotEmpty()
  origin: string

  @ApiProperty({
    example: 'São Paulo',
    description: 'Destino',
  })
  @IsString()
  @IsNotEmpty()
  destination: string

  @ApiProperty({
    example: 2500.00,
    description: 'Custo',
  })
  @IsNumber()
  @IsNotEmpty()
  cost: number

  @ApiProperty({
    example: 30,
    description: 'Dias para entrega',
  })
  @IsNumber()
  @IsNotEmpty()
  days: number
}


