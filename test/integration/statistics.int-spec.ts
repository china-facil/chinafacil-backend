import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Statistics API (Integration)', () => {
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

  describe('GET /api/statistics/total-clients-by-plan', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/total-clients-by-plan')
        .expect(401)
    })
  })

  describe('GET /api/statistics/monthly-metrics', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/monthly-metrics')
        .expect(401)
    })

    it('should return 401 without auth with query params', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/monthly-metrics?year=2024&month=1')
        .expect(401)
    })
  })

  describe('GET /api/statistics/admin-dashboard', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/admin-dashboard')
        .expect(401)
    })
  })

  describe('GET /api/statistics/solicitations-by-status', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/solicitations-by-status')
        .expect(401)
    })
  })

  describe('GET /api/statistics/user-growth', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/user-growth')
        .expect(401)
    })

    it('should return 401 without auth with query params', async () => {
      await request(app.getHttpServer())
        .get('/api/statistics/user-growth?months=6')
        .expect(401)
    })
  })
})







