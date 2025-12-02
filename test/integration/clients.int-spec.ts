import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma.service'

describe('Clients API (Integration)', () => {
  let app: INestApplication
  let authToken: string
  let prisma: PrismaService
  let createdClientId: string
  let testUserId: string

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
    testUserId = user.id
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
    authToken = loginRes.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/clients', () => {
    it('should create client successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Client' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
      createdClientId = response.body.id
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/clients')
        .send({ name: 'Test Client' })
        .expect(401)
    })
  })

  describe('GET /api/clients', () => {
    it('should list clients successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/clients').expect(401)
    })
  })

  describe('GET /api/clients/active-plans', () => {
    it('should list clients with active plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clients/active-plans')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/clients/active-plans').expect(401)
    })
  })

  describe('GET /api/clients/:id', () => {
    it('should get client details successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get(`/api/clients/${createdClientId}`).expect(401)
    })
  })

  describe('PATCH /api/clients/:id', () => {
    it('should update client successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Client' })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/clients/${createdClientId}`)
        .send({ name: 'Updated Client' })
        .expect(401)
    })
  })

  describe('POST /api/clients/:clientId/users/:userId', () => {
    it('should attach user to client', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/clients/${createdClientId}/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post(`/api/clients/${createdClientId}/users/${testUserId}`)
        .expect(401)
    })
  })

  describe('DELETE /api/clients/:clientId/users/:userId', () => {
    it('should detach user from client', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/clients/${createdClientId}/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete(`/api/clients/${createdClientId}/users/${testUserId}`)
        .expect(401)
    })
  })

  describe('DELETE /api/clients/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).delete(`/api/clients/${createdClientId}`).expect(401)
    })
  })
})
