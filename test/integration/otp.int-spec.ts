import { createTestContext, TestContext } from './test-helper'

describe('OTP API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/otp/send', () => {
    it('should send OTP successfully', async () => {
      const res = await ctx.req.post('/api/otp/send').send({ phone: '+5511999999999' })
      expect(res.status).toBe(201)
      expect(res.body).toBeDefined()
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.req.post('/api/otp/send').send({}).expect(400)
    })
  })

  describe('POST /api/otp/validate', () => {
    it('should return 400 with invalid payload', async () => {
      await ctx.req.post('/api/otp/validate').send({}).expect(400)
    })

    it('should return 400 with missing code', async () => {
      await ctx.req.post('/api/otp/validate').send({ phone: '+5511999999999' }).expect(400)
    })
  })

  describe('POST /api/otp/resend', () => {
    it('should resend OTP successfully', async () => {
      const res = await ctx.req.post('/api/otp/resend').send({ phone: '+5511999999999' })
      expect(res.status).toBe(201)
      expect(res.body).toBeDefined()
    })

    it('should return 400 with invalid payload', async () => {
      await ctx.req.post('/api/otp/resend').send({}).expect(400)
    })
  })
})

