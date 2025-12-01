import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Auth API (Integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
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
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(email)
    })
  })
})

