import { createTestContext, TestContext } from './test-helper'

describe('Plans API (Integration)', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await createTestContext()
  })

  describe('GET /api/plans/active', () => {
    it('should get active plans successfully (public)', async () => {
      const res = await ctx.req.get('/api/plans/active')
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/plans', () => {
    it('should create plan successfully', async () => {
      const res = await ctx.authReq.post('/api/plans').send({ name: 'Test Plan', price: 99.90, description: 'Test description' })
      expect(res.status).toBe(201)
    })

    it('should return 400 with invalid payload', async () => {
      const res = await ctx.authReq.post('/api/plans').send({})
      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.post('/api/plans').send({})
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/plans', () => {
    it('should list all plans successfully', async () => {
      const res = await ctx.authReq.get('/api/plans')
      expect(res.status).toBe(200)
    })

    it('should return 401 without auth', async () => {
      const res = await ctx.req.get('/api/plans')
      expect(res.status).toBe(401)
    })
  })

  describe("GET /api/plans/:id", () => {
    it("should get plan details successfully", async () => {
      const createRes = await ctx.authReq
        .post("/api/plans")
        .send({ name: "Test Plan", price: 99.9, description: "Test description" });
      const res = await ctx.authReq.get(`/api/plans/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent plan", async () => {
      const res = await ctx.authReq.get("/api/plans/99999");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/plans/1");
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/plans/:id", () => {
    it("should update plan successfully", async () => {
      const createRes = await ctx.authReq
        .post("/api/plans")
        .send({ name: "Test Plan", price: 99.9, description: "Test description" });
      const res = await ctx.authReq.patch(`/api/plans/${createRes.body.id}`).send({ name: "Updated Plan" });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent plan", async () => {
      const res = await ctx.authReq.patch("/api/plans/99999").send({ name: "Updated Plan" });
      expect(res.status).toBe(404);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.patch("/api/plans/1").send({ invalidField: "test" });
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.patch("/api/plans/1").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/plans/:id", () => {
    it("should delete plan successfully", async () => {
      const createRes = await ctx.authReq
        .post("/api/plans")
        .send({ name: "Test Plan", price: 99.9, description: "Test description" });
      const res = await ctx.authReq.delete(`/api/plans/${createRes.body.id}`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent plan", async () => {
      const res = await ctx.authReq.delete("/api/plans/99999");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/plans/1");
      expect(res.status).toBe(401);
    });
  });
})
