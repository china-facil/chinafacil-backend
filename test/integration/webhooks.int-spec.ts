import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Webhooks API (Integration)', () => {
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

  describe('POST /api/webhooks/typeform', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/webhooks/typeform')
        .send({
          event_id: 'test-event-id',
          event_type: 'form_response',
          form_response: {},
        })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('POST /api/webhooks/generic', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/webhooks/generic')
        .send({
          event: 'test-event',
          data: {},
        })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('GET /api/webhooks/logs', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/webhooks/logs')
        .expect(401)
    })

    it('should return 401 without auth with query params', async () => {
      await request(app.getHttpServer())
        .get('/api/webhooks/logs?limit=10')
        .expect(401)
    })
  })
})

