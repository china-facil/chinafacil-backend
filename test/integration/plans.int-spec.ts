import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Plans API (Integration)', () => {
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

  describe('GET /api/plans/active', () => {
    it('should return 200 status code', async () => {
      await request(app.getHttpServer()).get('/api/plans/active').expect(200)
    })

    it('should return array of plans', async () => {
      const response = await request(app.getHttpServer()).get('/api/plans/active')
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('GET /api/plans', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/plans').expect(401)
    })
  })

  describe('GET /api/plans/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/plans/test-id').expect(401)
    })
  })
})

