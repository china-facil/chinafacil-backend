import { createTestContext, TestContext } from './test-helper'

describe('Cart API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('POST /api/cart', () => {
    it('should create cart successfully', async () => {
      const res = await ctx.authReq.post('/api/cart').send({
        items: [
          {
            productId: 'test-product-id',
            quantity: 1,
            price: 10.0,
          },
        ],
      })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/cart').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/cart').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/cart', () => {
    it('should get cart successfully', async () => {
      const res = await ctx.authReq.get('/api/cart')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/cart')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/cart/all', () => {
    it('should list all carts (admin)', async () => {
      const res = await ctx.authReq.get('/api/cart/all')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/cart/all')
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/cart', () => {
    it('should update cart successfully', async () => {
      await ctx.authReq.post('/api/cart').send({
        items: [
          {
            productId: 'test-product-id',
            quantity: 1,
            price: 10.0,
          },
        ],
      })
      const res = await ctx.authReq.patch('/api/cart').send({
        items: [
          {
            productId: 'test-product-id-updated',
            quantity: 2,
            price: 20.0,
          },
        ],
      })
      expect(res.status).toBe(200)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.patch('/api/cart').send({ items: 'invalid' })
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.patch('/api/cart').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/cart/clear', () => {
    it('should clear cart successfully', async () => {
      await ctx.authReq.post('/api/cart').send({
        items: [
          {
            productId: 'test-product-id',
            quantity: 1,
            price: 10.0,
          },
        ],
      })
      const res = await ctx.authReq.delete('/api/cart/clear')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.delete('/api/cart/clear')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/cart/sync', () => {
    it('should sync cart successfully', async () => {
      const res = await ctx.authReq.post('/api/cart/sync').send({ local_cart: [], sync_type: 'update' })
      expect(res.status).toBe(201)
    })

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/cart/sync").send({ sync_type: "invalid-type" });
      expect(res.status).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/cart/sync').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/cart/report', () => {
    it('should generate PDF report successfully', async () => {
      const res = await ctx.req.post('/api/cart/report').send({
        data: {
          produtos: [
            {
              id: 'test-product-1',
              name: 'Produto Teste',
              variations: [
                {
                  quantity: 10,
                  price: 50,
                },
              ],
            },
          ],
          bid: 0.7,
          totalSolicitacao: {
            totalProdutos: 350,
          },
          totalDespesas: {
            totalFloat: 100,
          },
          custoIndividualPorItem: {
            'test-product-1': {
              preco_venda_item: 500,
            },
          },
        },
        detailed: false,
      })
      expect(res.status).toBe(201)
      expect(res.headers['content-type']).toContain('application/pdf')
    }, 30000)

    it('should generate PDF with international transport calculation', async () => {
      const res = await ctx.req.post('/api/cart/report').send({
        data: {
          produtos: [
            {
              id: 'test-product-1',
              name: 'Produto Teste',
              ncm_code: '8517.62.55',
              variations: [
                {
                  quantity: 10,
                  price: 50,
                },
              ],
            },
          ],
          totalVolume: 1.54,
          totalPeso: 500,
          dolar: 5.38,
          bid: 0.7,
          totalProdutos: {
            total: 'R$ 350,00',
            totalFloat: 350,
          },
          totalSolicitacao: {
            totalProdutos: 350,
            totalImpostos: 100,
            totalDespesasBrasil: 50,
            totalTransporteNacional: 30,
          },
          totalDespesas: {
            totalFloat: 100,
          },
          custoIndividualPorItem: {
            'test-product-1': {
              preco_venda_item: 500,
            },
          },
        },
        detailed: false,
      })
      expect(res.status).toBe(201)
      expect(res.headers['content-type']).toContain('application/pdf')
    }, 15000)

    it('should return 404 with invalid payload', async () => {
      const res = await ctx.req.post('/api/cart/report').send({
        data: {},
      })
      expect(res.status).toBe(404)
    })
  })
})
