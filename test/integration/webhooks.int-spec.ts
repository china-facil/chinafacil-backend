import { createTestContext, TestContext } from "./test-helper";
import * as crypto from "crypto";

describe("Webhooks API (Integration)", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/webhooks/typeform", () => {
    it("should handle typeform webhook successfully", async () => {
      process.env.TYPEFORM_WEBHOOK_SECRET = "test-secret";
      const secret = "test-secret";
      const payload = {
        event_type: "form_response",
        form_response: {
          answers: [
            {
              field: { ref: "email" },
              email: "test@example.com",
            },
          ],
        },
      };
      const bodyString = JSON.stringify(payload);
      const signature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");

      const res = await ctx.req
        .post("/api/webhooks/typeform")
        .set("typeform-signature", `sha256=${signature}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 with invalid payload", async () => {
      process.env.TYPEFORM_WEBHOOK_SECRET = "test-secret";
      const secret = "test-secret";
      const payload = {};
      const bodyString = JSON.stringify(payload);
      const signature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");

      await ctx.req
        .post("/api/webhooks/typeform")
        .set("typeform-signature", `sha256=${signature}`)
        .send(payload)
        .expect(400);
    });

    it("should return 401 without valid signature", async () => {
      await ctx.req
        .post("/api/webhooks/typeform")
        .send({
          event_type: "form_response",
          form_response: {},
        })
        .expect(401);
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
