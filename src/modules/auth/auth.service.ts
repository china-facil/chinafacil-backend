import {
  BadRequestException,
  Injectable,
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
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Usuário suspenso')
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Usuário inativo')
    }

    const { password: _, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

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
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
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

      if (user.status !== UserStatus.ACTIVE) {
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
            plan: true,
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
