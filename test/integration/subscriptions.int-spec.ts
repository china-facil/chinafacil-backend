import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Subscriptions API (Integration)', () => {
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

  describe('GET /api/subscriptions', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/subscriptions').expect(401)
    })
  })

  describe('GET /api/subscriptions/user/:userId', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/subscriptions/user/test-user-id')
        .expect(401)
    })
  })

  describe('GET /api/subscriptions/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/subscriptions/test-id')
        .expect(401)
    })
  })

  describe('POST /api/subscriptions/:id/cancel', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/subscriptions/test-id/cancel')
        .expect(401)
    })
  })
})

