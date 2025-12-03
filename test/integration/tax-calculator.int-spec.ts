/*
 * TESTES DESABILITADOS - Dependem de serviços externos (OpenAI API)
 * Descomente quando as APIs estiverem configuradas no ambiente de CI
 */

describe('Tax Calculator API (Integration) - DISABLED', () => {
  it.skip('tests disabled - requires OpenAI API', () => {})
})

/*
import { createTestContext, TestContext } from './test-helper'

describe('Tax Calculator API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/tax-calculations', () => {
    it('should create tax calculation successfully', async () => {
      const res = await ctx.req.post('/api/tax-calculations').send({
        productName: 'Produto Teste', volumeUn: 0.1, weightUn: 0.5, quantity: 10,
        unitPriceBrl: 100.0, currency: 'BRL', volumeType: 'unitario', weightType: 'unitario',
        totalVolume: 1.0, totalWeight: 5.0, supplierPrice: 80.0, totalCost: 1000.0
      })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/tax-calculations').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/tax-calculations', () => {
    it('should list tax calculations successfully', async () => {
      const res = await ctx.authReq.get('/api/tax-calculations')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/tax-calculations')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/tax-calculations/user/:userId', () => {
    it('should get user tax calculations successfully', async () => {
      const res = await ctx.authReq.get(`/api/tax-calculations/user/${ctx.adminUserId}`)
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/tax-calculations/user/some-id')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/calculator-users', () => {
    it('should create calculator user successfully', async () => {
      const email = `calc-user-${Date.now()}@example.com`
      const res = await ctx.req.post('/api/calculator-users').send({ email, telefone: '11999999999' })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/calculator-users').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/calculator-users', () => {
    it('should list calculator users successfully', async () => {
      const res = await ctx.authReq.get('/api/calculator-users')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/calculator-users')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/ncm/by-code', () => {
    it('should return 404 for non-existent NCM', async () => {
      const res = await ctx.req.get('/api/ncm/by-code?ncm_code=0000.00.00')
      expect(res.status).toBe(404)
    })

    it('should return 400 with invalid NCM format', async () => {
      const res = await ctx.req.get('/api/ncm/by-code?ncm_code=invalid')
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/ncm/item', () => {
    it('should get NCM item successfully', async () => {
      const res = await ctx.req.post('/api/ncm/item').send({ description: 'Test product description' })
      expect(res.status).toBe(200)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/ncm/item').send({})
      expect(res.status).toBe(400)
    })
  })
})
*/
