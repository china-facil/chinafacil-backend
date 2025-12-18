import { createTestContext, TestContext } from './test-helper'
import { TwilioService } from '../../src/integrations/sms/twilio/twilio.service'

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
    it('should validate OTP successfully', async () => {
      const phone = `+5511999${String(Date.now()).slice(-7)}`
      await ctx.req.post('/api/otp/send').send({ phone })
      const twilioService = ctx.app.get(TwilioService)
      const otpStore = (twilioService as any).otpStore
      const stored = otpStore.get(phone)
      expect(stored).toBeDefined()
      expect(stored.code).toBeDefined()
      const res = await ctx.req.post('/api/otp/validate').send({
        phone,
        code: stored.code,
      })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

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

