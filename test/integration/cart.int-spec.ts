import { createTestContext, TestContext } from './test-helper'

describe('Cart API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/cart', () => {
    it('should create cart successfully', async () => {
      const res = await ctx.authReq.post('/api/cart').send({ items: {} })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/cart').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/cart').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/cart', () => {
    it('should get cart successfully', async () => {
      const res = await ctx.authReq.get('/api/cart')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/cart')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/cart/all', () => {
    it('should list all carts (admin)', async () => {
      const res = await ctx.authReq.get('/api/cart/all')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/cart/all')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/cart', () => {
    it('should update cart successfully', async () => {
      const res = await ctx.authReq.patch('/api/cart').send({ items: {} })
      expect(res.status).toBe(200)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.patch('/api/cart').send({ items: 'invalid' })
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.patch('/api/cart').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/cart/clear', () => {
    it('should clear cart successfully', async () => {
      const res = await ctx.authReq.delete('/api/cart/clear')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.delete('/api/cart/clear')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/cart/sync', () => {
    it('should sync cart successfully', async () => {
      const res = await ctx.authReq.post('/api/cart/sync').send({ local_cart: [], sync_type: 'update' })
      expect(res.status).toBe(201)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/cart/sync').send({})
      expect(res.status).toBe(401)
    })
  })
})
