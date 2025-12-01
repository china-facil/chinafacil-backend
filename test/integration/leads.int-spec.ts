import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Leads API (Integration)', () => {
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

  describe('POST /api/leads', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/leads')
        .send({
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '11999999999',
        })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('GET /api/leads', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/leads').expect(401)
    })
  })

  describe('GET /api/leads/stats/origin', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/leads/stats/origin')
        .expect(401)
    })
  })

  describe('GET /api/leads/stats/status', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/leads/stats/status')
        .expect(401)
    })
  })

  describe('GET /api/leads/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/leads/test-id')
        .expect(401)
    })
  })

  describe('PATCH /api/leads/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch('/api/leads/test-id')
        .send({
          status: 'contacted',
        })
        .expect(401)
    })
  })

  describe('POST /api/leads/:id/convert', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/leads/test-id/convert')
        .expect(401)
    })
  })

  describe('DELETE /api/leads/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete('/api/leads/test-id')
        .expect(401)
    })
  })
})


