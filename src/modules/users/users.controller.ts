import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { extname, join } from 'path'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import {
  CreateUserDto,
  FilterUserDto,
  UpdatePhoneDto,
  UpdateSellerDto,
  UpdateUserDto,
} from './dto'
import { UsersService } from './users.service'

@ApiTags('users')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get-statistics-admin-dashboard')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard admin' })
  @ApiResponse({ status: 200, description: 'Estatísticas do dashboard' })
  async getStatisticsAdminDashboard(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.usersService.getStatisticsAdminDashboard(startDate, endDate)
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 'user-uuid',
          email: 'usuario@example.com',
          name: 'João Silva',
          phone: '11999999999',
          role: 'user',
          isSeller: false,
          seller: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async me(@CurrentUser() user: any) {
    return this.usersService.getDataUser(user.id)
  }

  @Post('users')
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 'user-uuid',
        email: 'usuario@example.com',
        name: 'João Silva',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get('users')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAllUsers(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto)
  }

  @Get('users/leads')
  @Roles('admin', 'seller')
  @ApiOperation({ summary: 'Listar leads (usuários sem assinatura)' })
  @ApiResponse({ status: 200, description: 'Lista de leads' })
  async findLeads() {
    return this.usersService.findLeads()
  }

  @Get('users/:id')
  @Roles('admin', 'seller', 'user', 'lead')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch('users/:id')
  @Roles('admin', 'user', 'seller', 'lead')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete('users/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }

  @Patch('users/:id/phone')
  @Roles('admin', 'user', 'seller', 'lead')
  @ApiOperation({ summary: 'Atualizar telefone do usuário' })
  @ApiResponse({ status: 200, description: 'Telefone atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updatePhone(
    @Param('id') id: string,
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.usersService.updatePhone(id, updatePhoneDto)
  }

  @Patch('users/:id/validate-phone')
  @Roles('admin', 'user', 'seller', 'lead')
  @ApiOperation({ summary: 'Validar telefone do usuário' })
  @ApiResponse({ status: 200, description: 'Telefone validado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async validatePhone(@Param('id') id: string) {
    return this.usersService.validatePhone(id)
  }

  @Patch('users/:id/seller')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar vendedor vinculado ao usuário' })
  @ApiResponse({ status: 200, description: 'Vendedor atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Vendedor não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateSeller(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return this.usersService.updateSeller(id, updateSellerDto)
  }

  @Post('users/:id/avatar')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Upload de avatar do usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPG, JPEG, PNG ou GIF)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido, muito grande ou não fornecido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads/avatars'
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(new BadRequestException('Arquivo não fornecido'), false)
        }
        if (!file.originalname || !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new BadRequestException('Apenas imagens são permitidas (JPG, JPEG, PNG ou GIF)'), false)
        }
        cb(null, true)
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido. Por favor, envie uma imagem.')
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`
    return this.usersService.updateAvatar(id, avatarUrl)
  }
}

