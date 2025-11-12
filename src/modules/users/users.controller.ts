import {
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
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import {
  CreateUserDto,
  FilterUserDto,
  UpdatePhoneDto,
  UpdateUserDto,
} from './dto'
import { UsersService } from './users.service'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto)
  }

  @Get('leads')
  @Roles('ADMIN', 'SELLER')
  @ApiOperation({ summary: 'Listar leads (usuários sem assinatura)' })
  @ApiResponse({ status: 200, description: 'Lista de leads' })
  async findLeads() {
    return this.usersService.findLeads()
  }

  @Get(':id')
  @Roles('ADMIN', 'SELLER', 'USER')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }

  @Patch(':id/phone')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Atualizar telefone do usuário' })
  @ApiResponse({ status: 200, description: 'Telefone atualizado com sucesso' })
  async updatePhone(
    @Param('id') id: string,
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.usersService.updatePhone(id, updatePhoneDto)
  }

  @Patch(':id/validate-phone')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Validar telefone do usuário' })
  @ApiResponse({ status: 200, description: 'Telefone validado com sucesso' })
  async validatePhone(@Param('id') id: string) {
    return this.usersService.validatePhone(id)
  }

  @Post(':id/avatar')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Upload de avatar do usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Apenas imagens são permitidas!'), false)
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
    const avatarUrl = `/uploads/avatars/${file.filename}`
    return this.usersService.updateAvatar(id, avatarUrl)
  }
}

