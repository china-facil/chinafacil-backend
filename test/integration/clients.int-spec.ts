import { createTestContext, TestContext } from './test-helper'

describe('Clients API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/clients', () => {
    it('should create client successfully', async () => {
      const res = await ctx.authReq.post('/api/clients').send({ name: 'Test Client', price: 100 })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/clients').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/clients').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/clients', () => {
    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/clients')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/clients/active-plans', () => {
    it('should list clients with active plans successfully', async () => {
      const res = await ctx.authReq.get('/api/clients/active-plans')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/clients/active-plans')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/clients/:id', () => {
    it('should return 404 for non-existent client', async () => {
      const res = await ctx.authReq.get('/api/clients/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/clients/some-id')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/clients/:id', () => {
    it('should return 404 for non-existent client', async () => {
      const res = await ctx.authReq.patch('/api/clients/non-existent-id').send({ name: 'Updated' })
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.patch('/api/clients/some-id').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/clients/:clientId/users/:userId', () => {
    it('should return 404 for non-existent client', async () => {
      const res = await ctx.authReq.post(`/api/clients/non-existent-id/users/${ctx.adminUserId}`)
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/clients/some-id/users/some-user')
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/clients/:id', () => {
    it('should return 404 for non-existent client', async () => {
      const res = await ctx.authReq.delete('/api/clients/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.delete('/api/clients/some-id')
      expect(res.status).toBe(401)
    })
  })
})
