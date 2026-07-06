import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activityLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const activityRouter = createRouter({
  list: authedQuery.input(z.object({ limit: z.number().min(1).max(50).optional() }).optional()).query(async ({ ctx, input }) => {
    const db = getDb();
    const limit = input?.limit || 20;
    return db.select().from(activityLogs).where(eq(activityLogs.userId, ctx.user.id)).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }),

  create: authedQuery.input(z.object({
    actionType: z.string(), trialId: z.number().optional(), serviceName: z.string().optional(),
    details: z.string().optional(), metadata: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const result = await db.insert(activityLogs).values({
      userId: ctx.user.id, trialId: input.trialId, actionType: input.actionType as typeof activityLogs.$inferInsert.actionType,
      serviceName: input.serviceName, details: input.details, metadata: input.metadata,
    });
    return { id: Number(result[0].insertId) };
  }),
});
