import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateFreightDto {
  @ApiProperty({
    example: "São Paulo",
    description: "Destino",
  })
  @IsString()
  @IsNotEmpty()
  destino: string;

  @ApiProperty({
    example: "SP",
    description: "UF",
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  uf: string;

  @ApiProperty({
    example: 10.5,
    description: "Taxa mínima",
  })
  @IsNotEmpty()
  @IsNumber()
  taxaMin: number;

  @ApiProperty({
    example: 5.2,
    description: "Peso até 10kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso10: number;

  @ApiProperty({
    example: 4.8,
    description: "Peso até 20kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso20: number;

  @ApiProperty({
    example: 4.5,
    description: "Peso até 35kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso35: number;

  @ApiProperty({
    example: 4.2,
    description: "Peso até 50kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso50: number;

  @ApiProperty({
    example: 4.0,
    description: "Peso até 70kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso70: number;

  @ApiProperty({
    example: 3.8,
    description: "Peso até 100kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso100: number;

  @ApiProperty({
    example: 3.5,
    description: "Peso até 300kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso300: number;

  @ApiProperty({
    example: 3.2,
    description: "Peso até 500kg",
  })
  @IsNotEmpty()
  @IsNumber()
  peso500: number;

  @ApiProperty({
    example: 15.0,
    description: "Entrega até 10kg",
  })
  @IsNotEmpty()
  @IsNumber()
  entregaAte10kg: number;

  @ApiProperty({
    example: 20.0,
    description: "Exceto de entrega",
  })
  @IsNotEmpty()
  @IsNumber()
  excDeEntrega: number;

  @ApiProperty({
    example: 1.5,
    description: "Ad valorem",
  })
  @IsNotEmpty()
  @IsNumber()
  advalorem: number;

  @ApiProperty({
    example: 2.0,
    description: "GRIS",
  })
  @IsNotEmpty()
  @IsNumber()
  gris: number;

  @ApiProperty({
    example: 50.0,
    description: "GRIS mínimo",
  })
  @IsNotEmpty()
  @IsNumber()
  grisMin: number;

  @ApiProperty({
    example: 0.5,
    description: "Pedágio por 100km",
  })
  @IsNotEmpty()
  @IsNumber()
  pedagio100: number;

  @ApiProperty({
    example: "5-7 dias úteis",
    description: "SLA de entrega",
  })
  @IsString()
  @IsNotEmpty()
  sla: string;

  @ApiProperty({
    example: "01310-100",
    description: "CEP",
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  cep: string;
}
