import { createTestContext, TestContext } from './test-helper'

describe('Solicitation Tracking API (Integration)', () => {
  let ctx: TestContext
  let solicitationId: string

  beforeAll(async () => {
    ctx = await createTestContext()

    const createSolicitationRes = await ctx.authReq.post('/api/solicitations').send({
      userId: ctx.adminUserId,
      type: 'supplier_search',
      quantity: 1,
      status: 'open',
    })
    
    solicitationId = createSolicitationRes.body.id
  })

  describe('GET /api/status-trecking/:id', () => {
    it('should get tracking status successfully', async () => {
      const res = await ctx.authReq.get(`/api/status-trecking/${solicitationId}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('steps')
      expect(res.body).toHaveProperty('avaliable_steps')
      expect(res.body).toHaveProperty('steps_values')
      expect(res.body.steps).toHaveProperty('step1')
      expect(res.body.steps.step1).toHaveProperty('order_received')
    })

    it('should return 404 for non-existent solicitation', async () => {
      const res = await ctx.authReq.get('/api/status-trecking/non-existent-id')
      expect(res.status).toBe(404)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get(`/api/status-trecking/${solicitationId}`)
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/trecking/solicitation/:id', () => {
    it('should get solicitation status history successfully', async () => {
      const res = await ctx.authReq.get(`/api/trecking/solicitation/${solicitationId}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('complete_status')
        expect(res.body[0]).toHaveProperty('step')
        expect(res.body[0]).toHaveProperty('status')
        expect(res.body[0]).toHaveProperty('status_text')
      }
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get(`/api/trecking/solicitation/${solicitationId}`)
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/trecking/solicitation/:id', () => {
    it('should add new status successfully', async () => {
      const res = await ctx.authReq.post(`/api/trecking/solicitation/${solicitationId}`).send({
        status: 'step1:analyzing_costs_logistics',
      })
      
      expect(res.status).toBe(201)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0]).toHaveProperty('complete_status')
      expect(res.body[0].complete_status).toBe('step1:analyzing_costs_logistics')
    })

    it('should add status with deadline successfully', async () => {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 7)
      
      const res = await ctx.authReq.post(`/api/trecking/solicitation/${solicitationId}`).send({
        status: 'step1:awaiting_customer_approval',
        time_date: deadline.toISOString(),
      })
      
      expect(res.status).toBe(201)
      expect(res.body[0].end_date).toBeDefined()
    })

    it('should return 400 when trying to go back to previous step', async () => {
      const res = await ctx.authReq.post(`/api/trecking/solicitation/${solicitationId}`).send({
        status: 'step1:order_received',
      })
      
      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Não é possível retornar a uma etapa anterior')
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post(`/api/trecking/solicitation/${solicitationId}`).send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post(`/api/trecking/solicitation/${solicitationId}`).send({
        status: 'step2:order_confirmed',
      })
      expect(res.status).toBe(401)
    })
  })

  describe('Status progression flow', () => {
    it('should allow progression through all steps in order', async () => {
      const newSolicitationRes = await ctx.authReq.post('/api/solicitations').send({
        userId: ctx.adminUserId,
        type: 'supplier_search',
        quantity: 1,
        status: 'open',
      })
      
      const newSolId = newSolicitationRes.body.id

      const statuses = [
        'step1:analyzing_costs_logistics',
        'step1:awaiting_customer_approval',
        'step1:awaiting_payment',
        'step2:order_confirmed',
      ]

      for (const status of statuses) {
        const res = await ctx.authReq.post(`/api/trecking/solicitation/${newSolId}`).send({ status })
        expect(res.status).toBe(201)
        expect(res.body[0].complete_status).toBe(status)
      }

      const historyRes = await ctx.authReq.get(`/api/trecking/solicitation/${newSolId}`)
      expect(historyRes.body.length).toBeGreaterThanOrEqual(statuses.length + 1)
    })
  })
})

