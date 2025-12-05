import { createTestContext, TestContext } from './test-helper'

describe('Settings API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('BoardingTypesController', () => {
    describe('GET /api/settings/boarding-types', () => {
      it('should list boarding types successfully', async () => {
        const res = await ctx.authReq.get('/api/settings/boarding-types')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/boarding-types').expect(401)
      })
    })

    describe('GET /api/settings/boarding-types/active', () => {
      it('should list active boarding types successfully', async () => {
        const res = await ctx.authReq.get('/api/settings/boarding-types/active')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/boarding-types/active').expect(401)
      })
    })

    describe('GET /api/settings/boarding-types/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/boarding-types/test-id').expect(401)
      })
    })

    describe('POST /api/settings/boarding-types', () => {
      it('should create boarding type successfully', async () => {
        const res = await ctx.authReq.post('/api/settings/boarding-types').send({
          cmbStart: 100,
          cmbEnd: 200,
          internationalShipping: 50.0,
          taxBlAwb: 25.0,
          storageAir: 30.0,
          storageSea: 35.0,
          taxAfrmm: 15.0,
          dispatcher: 40.0,
          sda: 20.0,
          deliveryTransport: 45.0,
          brazilExpenses: 1000.0,
        })
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('id')
      })

      it('should return 400 with invalid payload', async () => {
        await ctx.authReq.post('/api/settings/boarding-types').send({}).expect(400)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.post('/api/settings/boarding-types').send({
          brazilExpenses: 1000.0,
        }).expect(401)
      })
    })

    describe('PATCH /api/settings/boarding-types/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.patch('/api/settings/boarding-types/test-id').send({
          brazilExpenses: 2000.0,
        }).expect(401)
      })
    })

    describe('DELETE /api/settings/boarding-types/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.delete('/api/settings/boarding-types/test-id').expect(401)
      })
    })

    describe('GET /api/settings/default-boarding-type', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/default-boarding-type').expect(401)
      })
    })
  })

  describe('FreightsController', () => {
    describe('GET /api/settings/freights', () => {
      it('should list freights successfully', async () => {
        const res = await ctx.authReq.get('/api/settings/freights')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/freights').expect(401)
      })
    })

    describe('GET /api/settings/freights/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.get('/api/settings/freights/test-id').expect(401)
      })
    })

    describe('POST /api/settings/freights', () => {
      it('should create freight successfully', async () => {
        const res = await ctx.authReq.post('/api/settings/freights').send({
          destino: 'São Paulo',
          uf: 'SP',
          taxaMin: 10.5,
          peso10: 5.5,
          peso20: 5.0,
          peso35: 4.5,
          peso50: 4.2,
          peso70: 4.0,
          peso100: 3.8,
          peso300: 3.5,
          peso500: 3.2,
          entregaAte10kg: 15.0,
          excDeEntrega: 20.0,
          advalorem: 1.5,
          gris: 2.0,
          grisMin: 50.0,
          pedagio100: 0.5,
          sla: '5-7 dias úteis',
          cep: '01310-100',
        })
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('id')
      })

      it('should return 400 with invalid payload', async () => {
        await ctx.authReq.post('/api/settings/freights').send({}).expect(400)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.post('/api/settings/freights').send({
          destino: 'São Paulo',
          uf: 'SP',
        }).expect(401)
      })
    })

    describe('PATCH /api/settings/freights/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.patch('/api/settings/freights/1').send({
          peso10: 6.0,
        }).expect(401)
      })
    })

    describe('DELETE /api/settings/freights/:id', () => {
      it('should return 401 without auth', async () => {
        await ctx.req.delete('/api/settings/freights/test-id').expect(401)
      })
    })

    describe('POST /api/settings/frete/calcular', () => {
      it('should calculate freight successfully', async () => {
        const res = await ctx.authReq.post('/api/settings/frete/calcular').send({
          origin: 'Guangzhou',
          destination: 'São Paulo',
          weight: 1000,
        })
        expect(res.status).toBeGreaterThanOrEqual(200)
        expect(res.status).toBeLessThan(500)
      })

      it('should return 400 with invalid payload', async () => {
        await ctx.authReq.post('/api/settings/frete/calcular').send({}).expect(400)
      })

      it('should return 401 without auth', async () => {
        await ctx.req.post('/api/settings/frete/calcular').send({
          origin: 'Guangzhou',
          destination: 'São Paulo',
          weight: 1000,
        }).expect(401)
      })
    })
  })

  describe('QuotationController', () => {
    describe('GET /api/settings/quotation', () => {
      it('should return quotation successfully', async () => {
        const res = await ctx.req.get('/api/settings/quotation')
        expect(res.status).toBeGreaterThanOrEqual(200)
        expect(res.status).toBeLessThan(600)
      })
    })
  })
})
