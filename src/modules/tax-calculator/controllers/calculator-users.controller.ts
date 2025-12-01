import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { CreateCalculatorUserDto } from '../dto'
import { CalculatorUsersService } from '../services/calculator-users.service'

@ApiTags('tax-calculator')
@Controller('calculator-users')
export class CalculatorUsersController {
  constructor(
    private readonly calculatorUsersService: CalculatorUsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar usuário da calculadora' })
  @ApiResponse({ status: 201, description: 'Usuário registrado' })
  async create(@Body() createCalculatorUserDto: CreateCalculatorUserDto) {
    return this.calculatorUsersService.create(createCalculatorUserDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar usuários da calculadora (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll() {
    return this.calculatorUsersService.findAll()
  }
}


