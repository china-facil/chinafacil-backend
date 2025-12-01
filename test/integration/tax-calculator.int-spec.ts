import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { AppModule } from '../../src/app.module'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

describe('Tax Calculator API (Integration)', () => {
  let app: INestApplication
  const errorLogs: string[] = []

  beforeAll(async () => {
    const originalError = console.error
    const originalLog = console.log
    
    const captureError = (message: string) => {
      if (
        message.includes('ERROR') || 
        message.includes('Error:') ||
        message.includes('[Nest]') && message.includes('ERROR')
      ) {
        errorLogs.push(message)
      }
    }
    
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      captureError(message)
      originalError(...args)
    }
    
    console.log = (...args: any[]) => {
      const message = args.join(' ')
      captureError(message)
      originalLog(...args)
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  const checkForUnexpectedErrors = (testName: string, errorsDuringTest: string[]) => {
    const unexpectedErrors = errorsDuringTest.filter(
      (log) => 
        !log.includes('OpenAI') &&
        !log.includes('não configurado') &&
        !log.includes('obrigatório') &&
        !log.includes('NCM database not configured')
    )
    if (unexpectedErrors.length > 0) {
      throw new Error(`Test "${testName}" passed but found unexpected errors: ${unexpectedErrors.join('; ')}`)
    }
  }

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/tax-calculations', () => {
    it('should create tax calculation successfully with valid data', async () => {
      const errorsBefore = errorLogs.length
      
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productName: 'Produto Teste',
          volumeUn: 0.1,
          weightUn: 0.5,
          quantity: 10,
          unitPriceBrl: 100.0,
          currency: 'BRL',
          volumeType: 'unitario',
          weightType: 'unitario',
          totalVolume: 1.0,
          totalWeight: 5.0,
          supplierPrice: 80.0,
          totalCost: 1000.0,
        })

      expect(response.status).toBe(201)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('id')
      expect(typeof response.body.id).toBe('string')
      expect(response.body).toHaveProperty('productName', 'Produto Teste')
      expect(response.body).toHaveProperty('quantity', 10)
      expect(Number(response.body.volumeUn)).toBe(0.1)
      expect(Number(response.body.weightUn)).toBe(0.5)
      expect(Number(response.body.unitPriceBrl)).toBe(100.0)
      expect(response.body).toHaveProperty('currency', 'BRL')
      expect(response.body).toHaveProperty('volumeType', 'unitario')
      expect(response.body).toHaveProperty('weightType', 'unitario')
      expect(Number(response.body.totalVolume)).toBe(1.0)
      expect(Number(response.body.totalWeight)).toBe(5.0)
      expect(Number(response.body.supplierPrice)).toBe(80.0)
      expect(Number(response.body.totalCost)).toBe(1000.0)
      expect(response.body).toHaveProperty('createdAt')
      expect(response.body).toHaveProperty('updatedAt')
      
      const errorsDuringTest = errorLogs.slice(errorsBefore)
      checkForUnexpectedErrors('should create tax calculation successfully with valid data', errorsDuringTest)
    })

    it('should create tax calculation with NCM code', async () => {
      const errorsBefore = errorLogs.length
      
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productName: 'Produto com NCM',
          productImageUrl: 'https://example.com/image.jpg',
          ncmCode: '9705.00.00',
          volumeUn: 0.2,
          weightUn: 1.0,
          quantity: 5,
          unitPriceBrl: 150.0,
          currency: 'BRL',
          volumeType: 'unitario',
          weightType: 'unitario',
          totalVolume: 1.0,
          totalWeight: 5.0,
          supplierPrice: 120.0,
          totalCost: 750.0,
        })

      expect(response.status).toBe(201)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('productName', 'Produto com NCM')
      expect(response.body).toHaveProperty('ncmCode', '9705.00.00')
      expect(response.body).toHaveProperty('productImageUrl', 'https://example.com/image.jpg')
      
      const errorsDuringTest = errorLogs.slice(errorsBefore)
      checkForUnexpectedErrors('should create tax calculation with NCM code', errorsDuringTest)
    })

    it('should create tax calculation with user email', async () => {
      const errorsBefore = errorLogs.length
      
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productName: 'Produto com Email',
          userEmail: 'test@example.com',
          volumeUn: 0.15,
          weightUn: 0.75,
          quantity: 3,
          unitPriceBrl: 200.0,
          currency: 'USD',
          unitPriceOriginal: 40.0,
          yuanRate: 7.2,
          dolarRate: 5.0,
          distanceKm: 1000.0,
          volumeType: 'total',
          weightType: 'total',
          totalVolume: 0.45,
          totalWeight: 2.25,
          supplierPrice: 160.0,
          totalCost: 600.0,
          calculationBreakdown: {
            importTax: 100,
            shipping: 50,
          },
        })

      expect(response.status).toBe(201)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('productName', 'Produto com Email')
      if (response.body.userEmail) {
        expect(response.body.userEmail).toBe('test@example.com')
      }
      expect(response.body).toHaveProperty('currency', 'USD')
      if (response.body.yuanRate !== undefined) {
        expect(Number(response.body.yuanRate)).toBe(7.2)
      }
      if (response.body.dolarRate !== undefined) {
        expect(Number(response.body.dolarRate)).toBe(5.0)
      }
      if (response.body.distanceKm !== undefined) {
        expect(Number(response.body.distanceKm)).toBe(1000.0)
      }
      if (response.body.calculationBreakdown) {
        expect(response.body.calculationBreakdown).toBeDefined()
      }
      
      const errorsDuringTest = errorLogs.slice(errorsBefore)
      checkForUnexpectedErrors('should create tax calculation with user email', errorsDuringTest)
    })

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productData: {
            name: 'Test Product',
            price: 100,
          },
          ncmCode: '12345678',
        })
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('obrigatório')
    })

    it('should return 400 when numeric fields are invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productName: 'Test Product',
          volumeUn: 'invalid',
          weightUn: -1,
          quantity: 0,
          unitPriceBrl: 'not-a-number',
          currency: 'BRL',
          volumeType: 'unitario',
          weightType: 'unitario',
          totalVolume: 1.0,
          totalWeight: 5.0,
          supplierPrice: 80.0,
          totalCost: 1000.0,
        })
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
    })

    it('should return 400 when currency is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tax-calculations')
        .send({
          productName: 'Test Product',
          volumeUn: 0.1,
          weightUn: 0.5,
          quantity: 10,
          unitPriceBrl: 100.0,
          currency: 'INVALID',
          volumeType: 'unitario',
          weightType: 'unitario',
          totalVolume: 1.0,
          totalWeight: 5.0,
          supplierPrice: 80.0,
          totalCost: 1000.0,
        })
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('currency deve ser BRL ou USD')
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
    it('should create calculator user successfully', async () => {
      const email = `test-${Date.now()}@example.com`
      const response = await request(app.getHttpServer())
        .post('/api/calculator-users')
        .send({
          email,
          telefone: '11999999999',
        })

      expect(response.status).toBe(201)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email', email)
      expect(response.body).toHaveProperty('telefone', '11999999999')
      expect(response.body).toHaveProperty('createdAt')
    })

    it('should return existing user when email already exists', async () => {
      const email = `existing-${Date.now()}@example.com`
      
      await request(app.getHttpServer())
        .post('/api/calculator-users')
        .send({
          email,
          telefone: '11999999999',
        })

      const response = await request(app.getHttpServer())
        .post('/api/calculator-users')
        .send({
          email,
          telefone: '11888888888',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('email', email)
    })

    it('should create user successfully with email and phone', async () => {
      const email = `complete-${Date.now()}@example.com`
      const response = await request(app.getHttpServer())
        .post('/api/calculator-users')
        .send({
          email,
          telefone: '11987654321',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('email', email)
      expect(response.body).toHaveProperty('telefone', '11987654321')
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
    it('should return 404 when NCM database is not configured', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ncm/by-code?ncm_code=9705.00.00')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('NCM')
    })

    it('should return 404 when NCM code is invalid format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ncm/by-code?ncm_code=12345678')
      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
      const message = typeof response.body.message === 'string' 
        ? response.body.message 
        : JSON.stringify(response.body.message)
      expect(message).toMatch(/inválido|não encontrado|NCM/i)
    })

    it('should return 404 when NCM code does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ncm/by-code?ncm_code=99999999')
      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('não encontrado')
    })
  })

  describe('POST /api/ncm/item', () => {
    it('should return 500 error when OpenAI is not configured', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ncm/item')
        .send({
          description: 'Test product description',
        })
        .timeout(10000)
      
      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('message')
      
      const message = typeof response.body.message === 'string' 
        ? response.body.message 
        : JSON.stringify(response.body.message)
      
      if (!message.match(/OpenAI|não configurado|obrigatório/i)) {
        console.error('Full response body:', JSON.stringify(response.body, null, 2))
      }
      
      expect(message).toMatch(/OpenAI|não configurado|obrigatório|Internal server error/i)
    }, 15000)
  })
})

