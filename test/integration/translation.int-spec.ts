import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Translation API (Integration)', () => {
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

  describe('POST /api/translation/text', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/translation/text')
        .send({
          text: 'Hello world',
          to: 'pt',
        })
        .expect(401)
    })
  })

  describe('POST /api/translation/titles', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/translation/titles')
        .send({
          titles: ['Hello', 'World'],
          from: 'en',
          to: 'pt',
        })
        .expect(401)
    })
  })

  describe('POST /api/translation/product', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/translation/product')
        .send({
          product: {
            title: 'Test Product',
            description: 'Test Description',
          },
        })
        .expect(401)
    })
  })

  describe('POST /api/translation/detect-chinese', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/translation/detect-chinese')
        .send({
          text: '你好世界',
        })
        .expect(401)
    })
  })

  describe('DELETE /api/translation/clear-cache', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete('/api/translation/clear-cache')
        .expect(401)
    })
  })
})







