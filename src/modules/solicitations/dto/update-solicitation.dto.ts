import { PartialType } from '@nestjs/swagger'
import { CreateSolicitationDto } from './create-solicitation.dto'

export class UpdateSolicitationDto extends PartialType(CreateSolicitationDto) {}

