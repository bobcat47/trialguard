import { authRouter } from "./auth-router";
import { trialsRouter } from "./trials-router";
import { servicesRouter } from "./services-router";
import { savingsRouter } from "./savings-router";
import { activityRouter } from "./activity-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  trials: trialsRouter,
  services: servicesRouter,
  savings: savingsRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
