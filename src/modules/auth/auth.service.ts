import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { PrismaService } from '../../database/prisma.service'
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          subscription: {
            include: {
              client: true,
            },
          },
        },
      })

      if (!user) {
        this.logger.debug(`Usuário não encontrado para email: ${email}`)
        return null
      }

      this.logger.debug(`Usuário encontrado: ${user.email}, role: ${user.role}, status: ${user.status}`)
      this.logger.debug(`Password hash no banco: ${user.password.substring(0, 20)}...`)

      // PHP usa $2y$ enquanto Node.js bcrypt usa $2a$ ou $2b$
      // Converter $2y$ para $2b$ para compatibilidade
      const normalizedHash = user.password.replace(/^\$2y\$/, '$2b$')
      
      const isPasswordValid = await bcrypt.compare(password, normalizedHash)

      if (!isPasswordValid) {
        this.logger.debug(`Senha inválida para usuário: ${email}`)
        return null
      }

      this.logger.debug(`Senha válida para usuário: ${email}`)

      if (user.status === UserStatus.suspended) {
        throw new UnauthorizedException('Usuário suspenso')
      }

      if (user.status === UserStatus.inactive) {
        throw new UnauthorizedException('Usuário inativo')
      }

      const { password: _, ...result } = user
      return result
    } catch (error: any) {
      // Log do erro para debug
      console.error('Erro ao validar usuário:', error)
      
      // Se for erro de conexão com banco, relançar com mensagem mais clara
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
        throw new BadRequestException(
          'Erro de conexão com o banco de dados. Verifique se o banco está rodando.',
        )
      }
      
      throw error
    }
  }

  private getDefaultAbilities(role: string): Array<{ action: string; subject: string }> {
    switch (role) {
      case 'admin':
        return [{ action: 'manage', subject: 'all' }]
      case 'sourcer':
        return [
          { action: 'read', subject: 'Solicitations' },
          { action: 'manage', subject: 'Solicitations' },
          { action: 'read', subject: 'General' },
          { action: 'read', subject: 'UserProfile' },
          { action: 'read', subject: 'Auth' },
          { action: 'read', subject: 'Logout' },
          { action: 'read', subject: 'AdminDashboard' },
        ]
      case 'seller':
        return [
          { action: 'read', subject: 'Solicitations' },
          { action: 'manage', subject: 'Solicitations' },
          { action: 'read', subject: 'General' },
          { action: 'read', subject: 'UserProfile' },
          { action: 'read', subject: 'Auth' },
          { action: 'read', subject: 'Logout' },
          { action: 'read', subject: 'ClientDashboard' },
        ]
      case 'user':
      default:
        return [
          { action: 'read', subject: 'Solicitations' },
          { action: 'read', subject: 'General' },
          { action: 'read', subject: 'UserProfile' },
          { action: 'read', subject: 'Logout' },
          { action: 'read', subject: 'Auth' },
          { action: 'read', subject: 'ClientDashboard' },
        ]
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password)

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas')
      }

      // Buscar abilities do banco ou usar padrão baseado no role
      let abilities: Array<{ action: string; subject: string }> = []
      
      try {
        const abilitiesFromDb = await this.prisma.$queryRaw<Array<{ action: string; subject: string }>>`
          SELECT action, subject 
          FROM abilities 
          WHERE abilitiable_type = 'App\\\\Models\\\\User' 
          AND abilitiable_id = ${user.id}
        `
        
        if (abilitiesFromDb && abilitiesFromDb.length > 0) {
          abilities = abilitiesFromDb
        } else {
          abilities = this.getDefaultAbilities(user.role)
        }
      } catch (error) {
        // Se a tabela abilities não existir, usar abilities padrão
        this.logger.warn('Erro ao buscar abilities do banco, usando padrão:', error)
        abilities = this.getDefaultAbilities(user.role)
      }

      // Buscar favorites do usuário
      const favorites = await this.prisma.favoriteProduct.findMany({
        where: { userId: user.id },
        select: { itemId: true },
      })

      const favoritesIds = favorites
        .map((f) => f.itemId)
        .filter((id): id is string => id !== null)

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }

      const accessToken = this.jwtService.sign(payload)

      // Formatar dados do usuário conforme esperado pelo frontend
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: user.avatar || null,
        role: user.role,
        status: user.status,
        phoneVerified: user.phoneVerified,
        phone_verified: user.phoneVerified, // Duplicado para compatibilidade
        employees: user.employees || null,
        monthlyBilling: user.monthlyBilling || null,
        cnpj: user.cnpj || null,
        companyData: user.companyData || null,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        subscription: user.subscription || null,
        abilities,
        favorites: favoritesIds,
      }

      return {
        token: accessToken,
        data: userData,
      }
    } catch (error: any) {
      // Se já for uma exceção HTTP, relançar
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }
      
      // Log do erro para debug
      console.error('Erro no login:', error)
      
      // Se for erro de conexão com banco
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
        throw new BadRequestException(
          'Erro de conexão com o banco de dados. Verifique se o banco está rodando.',
        )
      }
      
      throw new BadRequestException('Erro ao realizar login. Tente novamente.')
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        cnpj: registerDto.cnpj,
        companyData: registerDto.companyData,
        role: UserRole.lead,
        status: UserStatus.active,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    })

    return {
      user,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      })

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado')
      }

      if (user.status !== UserStatus.active) {
        throw new UnauthorizedException('Usuário inativo ou suspenso')
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }

      const accessToken = this.jwtService.sign(newPayload)
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
      })

      return {
        accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
      }
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    })

    if (!user) {
      return {
        message:
          'Se o email existir, um link de recuperação será enviado em breve',
      }
    }

    const resetToken = randomBytes(32).toString('hex')
    const hashedToken = await bcrypt.hash(resetToken, 10)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        companyData: {
          ...(user.companyData as any),
          passwordResetToken: hashedToken,
          passwordResetExpires: new Date(Date.now() + 3600000),
        },
      },
    })

    return {
      message:
        'Se o email existir, um link de recuperação será enviado em breve',
      resetToken,
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany()

    let user = null

    for (const u of users) {
      const companyData = u.companyData as any
      if (companyData?.passwordResetToken) {
        const isValid = await bcrypt.compare(
          resetPasswordDto.token,
          companyData.passwordResetToken,
        )
        if (
          isValid &&
          companyData.passwordResetExpires &&
          new Date(companyData.passwordResetExpires) > new Date()
        ) {
          user = u
          break
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado')
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        companyData: {
          ...(user.companyData as any),
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      },
    })

    return {
      message: 'Senha alterada com sucesso',
    }
  }

  async verifyEmail(token: string) {
    const users = await this.prisma.user.findMany()

    let user = null

    for (const u of users) {
      const companyData = u.companyData as any
      if (companyData?.emailVerificationToken === token) {
        user = u
        break
      }
    }

    if (!user) {
      throw new BadRequestException('Token inválido')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        companyData: {
          ...(user.companyData as any),
          emailVerificationToken: null,
        },
      },
    })

    return {
      message: 'Email verificado com sucesso',
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        phoneVerified: true,
        employees: true,
        monthlyBilling: true,
        cnpj: true,
        companyData: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado')
    }

    return user
  }
}
