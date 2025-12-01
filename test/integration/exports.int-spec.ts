import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Exports API (Integration)', () => {
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

  describe('POST /api/exports/request', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/exports/request')
        .send({
          type: 'excel',
          filters: {},
        })
        .expect(401)
    })
  })

  describe('GET /api/exports', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/exports').expect(401)
    })

    it('should return 401 without auth with query params', async () => {
      await request(app.getHttpServer())
        .get('/api/exports?userId=test-user-id')
        .expect(401)
    })
  })

  describe('GET /api/exports/pending', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/exports/pending')
        .expect(401)
    })
  })

  describe('GET /api/exports/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/exports/test-id')
        .expect(401)
    })
  })

  describe('DELETE /api/exports/:id', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete('/api/exports/test-id')
        .expect(401)
    })
  })
})







