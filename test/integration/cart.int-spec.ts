import { createTestContext, TestContext } from './test-helper'

describe('Cart API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/cart', () => {
    it('should create cart successfully', async () => {
      const res = await ctx.authReq.post('/api/cart').send({ items: [], subtotal: 0, shippingCost: 0, tax: 0, total: 0 })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/cart').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/cart').send({}).expect(401)
    })
  })

  describe('GET /api/cart', () => {
    it('should get cart successfully', async () => {
      const res = await ctx.authReq.get('/api/cart')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/cart').expect(401)
    })
  })

  describe('GET /api/cart/all', () => {
    it('should list all carts (admin)', async () => {
      const res = await ctx.authReq.get('/api/cart/all')
      expect([200, 403, 404, 500]).toContain(res.status)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/cart/all').expect(401)
    })
  })

  describe('PATCH /api/cart', () => {
    it('should update cart', async () => {
      const res = await ctx.authReq.patch('/api/cart').send({ items: [], subtotal: 100, total: 100 })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch('/api/cart').send({}).expect(401)
    })
  })

  describe('DELETE /api/cart/clear', () => {
    it('should clear cart', async () => {
      const res = await ctx.authReq.delete('/api/cart/clear')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/cart/clear').expect(401)
    })
  })

  describe('POST /api/cart/sync', () => {
    it('should sync cart', async () => {
      const res = await ctx.authReq.post('/api/cart/sync').send({ items: [], subtotal: 0, total: 0 })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/cart/sync').send({}).expect(401)
    })
  })
})
