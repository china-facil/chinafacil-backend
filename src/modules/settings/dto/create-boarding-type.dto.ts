import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateBoardingTypeDto {
  @ApiProperty({
    example: 100,
    description: "CMB Start",
  })
  @IsNotEmpty()
  @IsInt()
  cmbStart: number;

  @ApiProperty({
    example: 200,
    description: "CMB End",
  })
  @IsNotEmpty()
  @IsInt()
  cmbEnd: number;

  @ApiProperty({
    example: 50.0,
    description: "Frete internacional",
  })
  @IsNotEmpty()
  @IsNumber()
  internationalShipping: number;

  @ApiProperty({
    example: 25.0,
    description: "Taxa BL/AWB",
  })
  @IsNotEmpty()
  @IsNumber()
  taxBlAwb: number;

  @ApiProperty({
    example: 30.0,
    description: "Armazenamento aéreo",
  })
  @IsNotEmpty()
  @IsNumber()
  storageAir: number;

  @ApiProperty({
    example: 35.0,
    description: "Armazenamento marítimo",
  })
  @IsNotEmpty()
  @IsNumber()
  storageSea: number;

  @ApiProperty({
    example: 15.0,
    description: "Taxa AFRMM",
  })
  @IsNotEmpty()
  @IsNumber()
  taxAfrmm: number;

  @ApiProperty({
    example: 40.0,
    description: "Despachante",
  })
  @IsNotEmpty()
  @IsNumber()
  dispatcher: number;

  @ApiProperty({
    example: 20.0,
    description: "SDA",
  })
  @IsNotEmpty()
  @IsNumber()
  sda: number;

  @ApiProperty({
    example: 45.0,
    description: "Transporte de entrega",
  })
  @IsNotEmpty()
  @IsNumber()
  deliveryTransport: number;

  @ApiPropertyOptional({
    example: 10.0,
    description: "Outras taxas",
  })
  @IsOptional()
  @IsNumber()
  otherFees?: number;

  @ApiProperty({
    example: 1500.5,
    description: "Despesas no Brasil",
  })
  @IsNotEmpty()
  @IsNumber()
  brazilExpenses: number;
}
