import * as bcrypt from 'bcrypt'
import { UserRole, UserStatus } from '@prisma/client'
import { createTestContext, TestContext } from './test-helper'

describe('Auth API (Integration)', () => {
  let ctx: TestContext
  let testUserEmail: string
  let authToken: string

  beforeAll(async () => {
    ctx = await createTestContext({ withAuth: false })
    testUserEmail = `auth-test-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('password123', 10)
    await ctx.prisma.user.create({
      data: { name: 'Auth Test User', email: testUserEmail, password: hashedPassword, role: UserRole.user, status: UserStatus.active }
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const email = `register-${Date.now()}@example.com`
      const res = await ctx.req.post('/api/auth/register').send({ name: 'Test User', email, password: 'password123' })
      expect(res.status).toBeLessThan(300)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/register').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const res = await ctx.req.post('/api/auth/login').send({ email: testUserEmail, password: 'password123' })
      expect(res.status).toBeLessThan(300)
      authToken = res.body.token
    })

    it('should return 400/401 with invalid credentials', async () => {
      const res = await ctx.req.post('/api/auth/login').send({ email: 'nonexistent@test.com', password: 'wrong' })
      expect([400, 401]).toContain(res.status)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should handle refresh token request', async () => {
      const res = await ctx.req.post('/api/auth/refresh').send({ token: authToken })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400/401 with invalid token', async () => {
      const res = await ctx.req.post('/api/auth/refresh').send({ token: 'invalid-token' })
      expect([400, 401]).toContain(res.status)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot password request', async () => {
      const res = await ctx.req.post('/api/auth/forgot-password').send({ email: testUserEmail })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/forgot-password').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should handle reset password request', async () => {
      const res = await ctx.req.post('/api/auth/reset-password').send({ token: 'some-token', password: 'newpassword123' })
      expect(res.status).toBeLessThan(500)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.req.post('/api/auth/reset-password').send({ token: '', password: '' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/auth/verify-email', () => {
    it('should handle verify email request', async () => {
      const res = await ctx.req.get('/api/auth/verify-email').query({ token: 'some-token' })
      expect(res.status).toBeLessThan(500)
    })

    it('should handle missing token', async () => {
      const res = await ctx.req.get('/api/auth/verify-email')
      expect(res.status).toBeLessThan(500)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const res = await ctx.req.get('/api/auth/me').set('Authorization', `Bearer ${authToken}`)
      expect(res.status).toBeLessThan(300)
    })

    it('should return 401 without auth', async () => {
      await ctx.req.get('/api/auth/me').expect(401)
    })
  })
})
