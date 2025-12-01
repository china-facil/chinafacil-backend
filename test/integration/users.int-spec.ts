import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma.service'

describe('Users API (Integration)', () => {
  let app: INestApplication
  let authToken: string
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()

    prisma = moduleFixture.get<PrismaService>(PrismaService)
    const email = `admin-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('password123', 10)
    await prisma.user.create({
      data: { name: 'Admin User', email, password: hashedPassword, role: UserRole.admin, status: UserStatus.active }
    })
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
    authToken = loginRes.body.access_token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      const email = `user-${Date.now()}@example.com`
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New User', email, password: 'password123' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
      expect(response.body.email).toBe(email)
    })
  })
})

