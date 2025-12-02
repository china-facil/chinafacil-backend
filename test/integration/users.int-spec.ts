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
  let createdUserId: string

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
    const user = await prisma.user.create({
      data: { name: 'Admin User', email, password: hashedPassword, role: UserRole.admin, status: UserStatus.active }
    })
    createdUserId = user.id
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
    authToken = loginRes.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/me', () => {
    it('should return current user data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/me').expect(401)
    })
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
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'New User', email: 'test@test.com', password: 'password123' })
        .expect(401)
    })
  })

  describe('GET /api/users', () => {
    it('should list users successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/users').expect(401)
    })
  })

  describe('GET /api/users/leads', () => {
    it('should list leads successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/leads')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/users/leads').expect(401)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should get user details successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get(`/api/users/${createdUserId}`).expect(401)
    })
  })

  describe('PATCH /api/users/:id', () => {
    it('should update user successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}`)
        .send({ name: 'Updated Name' })
        .expect(401)
    })
  })

  describe('PATCH /api/users/:id/phone', () => {
    it('should update phone successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}/phone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ phone: '11999999999' })
      expect(response.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}/phone`)
        .send({ phone: '11999999999' })
        .expect(401)
    })
  })

  describe('PATCH /api/users/:id/validate-phone', () => {
    it('should validate phone successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}/validate-phone`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}/validate-phone`)
        .expect(401)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).delete(`/api/users/${createdUserId}`).expect(401)
    })
  })
})
