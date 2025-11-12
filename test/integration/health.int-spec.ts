import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Health API (Integration)', () => {
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

  describe('GET /api/health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200)

      expect(response.body).toBeDefined()
    })

    it('should return health status with required fields', async () => {
      const response = await request(app.getHttpServer()).get('/api/health')

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('database')
      expect(response.body.status).toBe('ok')
    })

    it('should return valid timestamp', async () => {
      const response = await request(app.getHttpServer()).get('/api/health')

      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.toString()).not.toBe('Invalid Date')
    })

    it('should return numeric uptime', async () => {
      const response = await request(app.getHttpServer()).get('/api/health')

      expect(typeof response.body.uptime).toBe('number')
      expect(response.body.uptime).toBeGreaterThan(0)
    })
  })
})

