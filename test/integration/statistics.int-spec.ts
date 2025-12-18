import { createTestContext, TestContext } from "./test-helper";

describe("Statistics API (Integration)", () => {
  let ctx: TestContext;

  const statisticsEndpoints = [
    { path: "/api/statistics/total-clients-by-plan", description: "statistics" },
    { path: "/api/statistics/monthly-metrics", description: "monthly metrics" },
    { path: "/api/statistics/admin-dashboard", description: "admin dashboard statistics" },
    { path: "/api/statistics/solicitations-by-status", description: "solicitations by status" },
    { path: "/api/statistics/user-growth", description: "user growth" },
  ];

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  statisticsEndpoints.forEach(({ path, description }) => {
    describe(`GET ${path}`, () => {
      it(`should return ${description} successfully`, async () => {
        const res = await ctx.authReq.get(path);
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
      });

      it("should return 401 without auth", async () => {
        await ctx.req.get(path).expect(401);
      });
    });
  });
});
