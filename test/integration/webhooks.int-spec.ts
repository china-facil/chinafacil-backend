import { createTestContext, TestContext } from "./test-helper";

describe("Webhooks API (Integration)", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/webhooks/typeform", () => {
    it("should return 401 without valid signature", async () => {
      await ctx.req
        .post("/api/webhooks/typeform")
        .send({
          event_type: "form_response",
          form_response: {},
        })
        .expect(401);
    });

    it("should return 401 without signature (guard executes before validation)", async () => {
      await ctx.req.post("/api/webhooks/typeform").send({}).expect(401);
    });
  });

  describe("POST /api/webhooks/generic", () => {
    it("should handle generic webhook successfully", async () => {
      const res = await ctx.req.post("/api/webhooks/generic").send({ payload: { test: true } });
      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
    });

    it("should return 400 with invalid payload", async () => {
      await ctx.req.post("/api/webhooks/generic").send({}).expect(400);
    });
  });

  describe("GET /api/webhooks/logs", () => {
    it("should get webhook logs successfully", async () => {
      const res = await ctx.authReq.get("/api/webhooks/logs");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without auth", async () => {
      await ctx.req.get("/api/webhooks/logs").expect(401);
    });
  });
});
