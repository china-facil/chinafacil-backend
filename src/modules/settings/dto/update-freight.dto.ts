import { PartialType } from '@nestjs/swagger'
import { CreateFreightDto } from './create-freight.dto'

export class UpdateFreightDto extends PartialType(CreateFreightDto) {}


