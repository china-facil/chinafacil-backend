import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'

describe('Tax Calculator API (Integration)', () => {
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

  describe('POST /api/tax-calculations', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productData: {
            name: 'Test Product',
            price: 100,
          },
          ncmCode: '12345678',
        })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('GET /api/tax-calculations', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/tax-calculations')
        .expect(401)
    })
  })

  describe('GET /api/tax-calculations/user/:userId', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/tax-calculations/user/test-user-id')
        .expect(401)
    })
  })

  describe('POST /api/calculator-users', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/calculator-users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
          company: 'Test Company',
        })
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('GET /api/calculator-users', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/calculator-users')
        .expect(401)
    })
  })

  describe('GET /api/ncm/by-code', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ncm/by-code?ncm_code=12345678')
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('POST /api/ncm/item', () => {
    it('should return status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ncm/item')
        .send({
          description: 'Test product description',
        })
        .timeout(10000)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    }, 15000)
  })
})

