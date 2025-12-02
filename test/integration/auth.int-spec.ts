import { createTestContext, TestContext } from './test-helper'

describe('Auth API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const email = `newuser-${Date.now()}@example.com`
      const res = await ctx.req.post('/api/auth/register').send({ name: 'New User', email, password: 'password123' })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/register').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const email = `loginuser-${Date.now()}@example.com`
      await ctx.req.post('/api/auth/register').send({ name: 'Login User', email, password: 'password123' })
      const res = await ctx.req.post('/api/auth/login').send({ email, password: 'password123' })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/login').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 with wrong credentials', async () => {
      const res = await ctx.req.post('/api/auth/login').send({ email: 'wrong@example.com', password: 'wrongpassword' })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should return 401 with invalid refresh token', async () => {
      const res = await ctx.req.post('/api/auth/refresh').send({ refreshToken: 'invalid-token' })
      expect(res.status).toBe(401)
    })

    it('should return 400 without refresh token', async () => {
      const res = await ctx.req.post('/api/auth/refresh').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should request password reset successfully', async () => {
      const res = await ctx.req.post('/api/auth/forgot-password').send({ email: 'test@example.com' })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/forgot-password').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should return 400 with invalid token', async () => {
      const res = await ctx.req.post('/api/auth/reset-password').send({ token: 'invalid-token', password: 'newpassword123' })
      expect(res.status).toBe(400)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/reset-password').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/auth/verify-email', () => {
    it('should return 400 with invalid token', async () => {
      const res = await ctx.req.get('/api/auth/verify-email?token=invalid-token')
      expect(res.status).toBe(400)
    })

    it('should return 200 without token (graceful handling)', async () => {
      const res = await ctx.req.get('/api/auth/verify-email')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user successfully', async () => {
      const res = await ctx.authReq.get('/api/auth/me')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/auth/me')
      expect(res.status).toBe(401)
    })
  })
})
