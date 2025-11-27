import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Cart API (Integration)', () => {
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

  describe('POST /api/cart', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/cart')
        .send({
          items: [],
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          total: 0,
        })
        .expect(401)
    })
  })

  describe('GET /api/cart', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/cart').expect(401)
    })
  })

  describe('GET /api/cart/all', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/api/cart/all').expect(401)
    })
  })

  describe('PATCH /api/cart', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch('/api/cart')
        .send({
          items: [],
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          total: 0,
        })
        .expect(401)
    })
  })

  describe('DELETE /api/cart/clear', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete('/api/cart/clear')
        .expect(401)
    })
  })

  describe('POST /api/cart/sync', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/cart/sync')
        .send({
          items: [],
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          total: 0,
        })
        .expect(401)
    })
  })
})

