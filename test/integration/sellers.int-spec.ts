import { createTestContext, TestContext } from './test-helper'

describe('Sellers API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/sellers', () => {
    it('should create seller successfully', async () => {
      const userRes = await ctx.req.post('/api/auth/register').send({
        name: 'Test User',
        email: `user-${Date.now()}@example.com`,
        password: 'password123',
      })
      const res = await ctx.authReq.post('/api/sellers').send({
        userId: userRes.body.user.id,
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('userId')
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/sellers').send({})
      expect(res.status).toBe(400)
    })

    it('should return 400 with non-existent user', async () => {
      const res = await ctx.authReq.post('/api/sellers').send({
        userId: 'non-existent-user-id',
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/sellers').send({
        userId: ctx.adminUserId,
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/sellers', () => {
    it('should list sellers successfully without auth', async () => {
      const res = await ctx.req.get('/api/sellers')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('meta')
    })

    it('should return 400 with invalid query params', async () => {
      const res = await ctx.req.get('/api/sellers?page=-1')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/sellers/:id', () => {
    it('should get seller details successfully', async () => {
      const userRes = await ctx.req.post('/api/auth/register').send({
        name: 'Test User',
        email: `user-${Date.now()}@example.com`,
        password: 'password123',
      })
      const createRes = await ctx.authReq.post('/api/sellers').send({
        userId: userRes.body.user.id,
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      const res = await ctx.authReq.get(`/api/sellers/${createRes.body.id}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('clientCount')
    })

    it('should return 404 for non-existent seller', async () => {
      const res = await ctx.authReq.get('/api/sellers/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/sellers/some-id')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/sellers/:id', () => {
    it('should update seller successfully', async () => {
      const userRes = await ctx.req.post('/api/auth/register').send({
        name: 'Test User',
        email: `user-${Date.now()}@example.com`,
        password: 'password123',
      })
      const createRes = await ctx.authReq.post('/api/sellers').send({
        userId: userRes.body.user.id,
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      const res = await ctx.authReq
        .patch(`/api/sellers/${createRes.body.id}`)
        .send({ name: 'Updated Seller' })
      expect(res.status).toBe(200)
    })

    it('should return 404 for non-existent seller', async () => {
      const res = await ctx.authReq
        .patch('/api/sellers/non-existent-id')
        .send({ name: 'Updated' })
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.patch('/api/sellers/some-id').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/sellers/:id', () => {
    it('should delete seller successfully', async () => {
      const userRes = await ctx.req.post('/api/auth/register').send({
        name: 'Test User',
        email: `user-${Date.now()}@example.com`,
        password: 'password123',
      })
      const createRes = await ctx.authReq.post('/api/sellers').send({
        userId: userRes.body.user.id,
        name: 'Test Seller',
        email: `seller-${Date.now()}@example.com`,
      })
      const res = await ctx.authReq.delete(`/api/sellers/${createRes.body.id}`)
      expect(res.status).toBe(200)
    })

    it('should return 404 for non-existent seller', async () => {
      const res = await ctx.authReq.delete('/api/sellers/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.delete('/api/sellers/some-id')
      expect(res.status).toBe(401)
    })
  })
})

