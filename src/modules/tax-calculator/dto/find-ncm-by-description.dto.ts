import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject } from "class-validator";

export class FindNcmByDescriptionDto {
  @ApiProperty({
    description: "Dados do produto para identificação do NCM",
    example: { id: "123", name: "Produto exemplo" },
  })
  @IsNotEmpty()
  @IsObject()
  product: {
    id?: string;
    name?: string;
    [key: string]: any;
  };
}
