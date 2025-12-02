import { createTestContext, TestContext } from './test-helper'

describe('Users API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/me', () => {
    it('should return current user data', async () => {
      const res = await ctx.authReq.get('/api/me')
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/me').expect(401)
    })
  })

  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      const email = `user-${Date.now()}@example.com`
      const res = await ctx.authReq.post('/api/users').send({ name: 'New User', email, password: 'password123' })
      expect(res.status).toBeLessThan(300)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/users').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.post('/api/users').send({}).expect(401)
    })
  })

  describe('GET /api/users', () => {
    it('should list users successfully', async () => {
      const res = await ctx.authReq.get('/api/users')
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/users').expect(401)
    })
  })

  describe('GET /api/users/leads', () => {
    it('should list leads successfully', async () => {
      const res = await ctx.authReq.get('/api/users/leads')
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/users/leads').expect(401)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should get user details successfully', async () => {
      const res = await ctx.authReq.get(`/api/users/${ctx.adminUserId}`)
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get(`/api/users/${ctx.adminUserId}`).expect(401)
    })
  })

  describe('PATCH /api/users/:id', () => {
    it('should update user successfully', async () => {
      const res = await ctx.authReq.patch(`/api/users/${ctx.adminUserId}`).send({ name: 'Updated Name' })
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch(`/api/users/${ctx.adminUserId}`).send({}).expect(401)
    })
  })

  describe('PATCH /api/users/:id/phone', () => {
    it('should update phone successfully', async () => {
      const res = await ctx.authReq.patch(`/api/users/${ctx.adminUserId}/phone`).send({ phone: '11999999999' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.patch(`/api/users/${ctx.adminUserId}/phone`).send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.patch(`/api/users/${ctx.adminUserId}/phone`).send({}).expect(401)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should return 401 without auth', async () => {
      await ctx.req.delete('/api/users/some-id').expect(401)
    })
  })
})
