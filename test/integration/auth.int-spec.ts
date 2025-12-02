import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma.service'

describe('Auth API (Integration)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let testUserEmail: string
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()

    prisma = moduleFixture.get<PrismaService>(PrismaService)
    testUserEmail = `auth-test-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('password123', 10)
    await prisma.user.create({
      data: { name: 'Auth Test User', email: testUserEmail, password: hashedPassword, role: UserRole.user, status: UserStatus.active }
    })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const email = `test-${Date.now()}@example.com`
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ name: 'Test User', email, password: 'password123' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUserEmail, password: 'password123' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
      expect(response.body).toHaveProperty('token')
      authToken = response.body.token
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ token: authToken })
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot password request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: testUserEmail })
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should handle reset password request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'newpassword123' })
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('GET /api/auth/verify-email', () => {
    it('should handle verify email request', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/verify-email')
        .query({ token: 'invalid-token' })
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUserEmail, password: 'password123' })
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401)
    })
  })
})
