import { IsBoolean, IsObject, IsOptional } from 'class-validator'

export class GenerateReportDto {
  @IsObject()
  data: Record<string, any>

  @IsBoolean()
  @IsOptional()
  detailed?: boolean
}

