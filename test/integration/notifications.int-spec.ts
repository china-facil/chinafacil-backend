import { createTestContext, TestContext } from "./test-helper";

describe("Notifications API (Integration)", () => {
  let ctx: TestContext;

  const createNotificationPayload = (userId: string) => ({
    userId,
    type: "new_message",
    data: { message: "Test notification", title: "Test" },
  });

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  describe("POST /api/notifications", () => {
    it("should create notification successfully", async () => {
      const res = await ctx.authReq.post("/api/notifications").send(createNotificationPayload(ctx.adminUserId));
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid payload", async () => {
      const res = await ctx.authReq.post("/api/notifications").send({});
      expect(res.status).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.post("/api/notifications").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/notifications", () => {
    it("should list user notifications successfully", async () => {
      const res = await ctx.authReq.get("/api/notifications");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.get("/api/notifications");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/notifications/:id/read", () => {
    it("should mark notification as read successfully", async () => {
      const createRes = await ctx.authReq
        .post("/api/notifications")
        .send(createNotificationPayload(ctx.adminUserId));
      const res = await ctx.authReq.put(`/api/notifications/${createRes.body.id}/read`);
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent notification", async () => {
      const res = await ctx.authReq.put("/api/notifications/00000000-0000-0000-0000-000000000000/read");
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.put("/api/notifications/some-id/read");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/notifications/mark-all-as-read", () => {
    it("should mark all notifications as read successfully", async () => {
      const res = await ctx.authReq.put("/api/notifications/mark-all-as-read");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.put("/api/notifications/mark-all-as-read");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/notifications/mark-all-as-unread", () => {
    it("should mark all notifications as unread successfully", async () => {
      const res = await ctx.authReq.put("/api/notifications/mark-all-as-unread");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.put("/api/notifications/mark-all-as-unread");
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/notifications", () => {
    it("should delete all notifications successfully", async () => {
      const res = await ctx.authReq.delete("/api/notifications");
      expect(res.status).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await ctx.req.delete("/api/notifications");
      expect(res.status).toBe(401);
    });
  });
});
