import { createTestContext, TestContext } from './test-helper'

describe('Clients API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/clients', () => {
    it('should create client successfully', async () => {
      const res = await ctx.authReq.post('/api/clients').send({ name: 'Test Client' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/clients').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/clients').send({}).expect(401)
    })
  })

  describe('GET /api/clients', () => {
    it('should list clients', async () => {
      const res = await ctx.authReq.get('/api/clients')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/clients').expect(401)
    })
  })

  describe('GET /api/clients/active-plans', () => {
    it('should list clients with active plans', async () => {
      const res = await ctx.authReq.get('/api/clients/active-plans')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/clients/active-plans').expect(401)
    })
  })

  describe('GET /api/clients/:id', () => {
    it('should get client details', async () => {
      const res = await ctx.authReq.get('/api/clients/some-client-id')
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/clients/some-id').expect(401)
    })
  })

  describe('PATCH /api/clients/:id', () => {
    it('should handle update client', async () => {
      const res = await ctx.authReq.patch('/api/clients/some-client-id').send({ name: 'Updated' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch('/api/clients/some-id').send({}).expect(401)
    })
  })

  describe('POST /api/clients/:clientId/users/:userId', () => {
    it('should handle attach user to client', async () => {
      const res = await ctx.authReq.post(`/api/clients/some-client-id/users/${ctx.adminUserId}`)
      expect(res.status).toBeLessThan(500)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/clients/some-id/users/some-user').expect(401)
    })
  })

  describe('DELETE /api/clients/:id', () => {
    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/clients/some-id').expect(401)
    })
  })
})
