import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { trials, savingsRecords, activityLogs } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const trialsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(trials).where(eq(trials.userId, ctx.user.id)).orderBy(desc(trials.endDate));
  }),

  getById: authedQuery.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const db = getDb();
    const [trial] = await db.select().from(trials).where(and(eq(trials.id, input.id), eq(trials.userId, ctx.user.id)));
    return trial || null;
  }),

  create: authedQuery
    .input(z.object({
      serviceName: z.string().min(1).max(100),
      planName: z.string().max(100).optional(),
      serviceCategory: z.string().max(50).optional(),
      serviceBrandColor: z.string().max(7).optional(),
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
      trialLengthDays: z.number().min(1).max(365),
      postTrialAmount: z.string().or(z.number()).optional(),
      postTrialCurrency: z.string().max(3).optional(),
      postTrialPeriod: z.string().max(20).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(trials).values({
        userId: ctx.user.id,
        serviceName: input.serviceName,
        planName: input.planName || "",
        serviceCategory: input.serviceCategory || "other",
        serviceBrandColor: input.serviceBrandColor || "#8b5cf6",
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        trialLengthDays: input.trialLengthDays,
        postTrialAmount: input.postTrialAmount?.toString() || "0.00",
        postTrialCurrency: input.postTrialCurrency || "GBP",
        postTrialPeriod: input.postTrialPeriod || "monthly",
        notes: input.notes || "",
      });
      const trialId = Number(result[0].insertId);
      await db.insert(activityLogs).values({
        userId: ctx.user.id, trialId, actionType: "trial_added",
        serviceName: input.serviceName, details: `Added ${input.serviceName} trial`,
      });
      return { id: trialId };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      serviceName: z.string().min(1).max(100).optional(),
      planName: z.string().max(100).optional(),
      endDate: z.string().or(z.date()).optional(),
      postTrialAmount: z.string().or(z.number()).optional(),
      notes: z.string().optional(),
      autoCancelEnabled: z.boolean().optional(),
      autoCancelTiming: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      const updateData: Record<string, unknown> = {};
      if (updates.serviceName !== undefined) updateData.serviceName = updates.serviceName;
      if (updates.planName !== undefined) updateData.planName = updates.planName;
      if (updates.endDate !== undefined) updateData.endDate = new Date(updates.endDate);
      if (updates.postTrialAmount !== undefined) updateData.postTrialAmount = updates.postTrialAmount.toString();
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.autoCancelEnabled !== undefined) {
        updateData.autoCancelEnabled = updates.autoCancelEnabled;
        updateData.autoCancelStatus = updates.autoCancelEnabled ? "queued" : "not_queued";
      }
      if (updates.autoCancelTiming !== undefined) updateData.autoCancelTiming = updates.autoCancelTiming;
      await db.update(trials).set(updateData).where(and(eq(trials.id, id), eq(trials.userId, ctx.user.id)));
      return { success: true };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number(), method: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [trial] = await db.select().from(trials).where(and(eq(trials.id, input.id), eq(trials.userId, ctx.user.id)));
      if (!trial) return { success: false, error: "Trial not found" };
      const amountSaved = parseFloat(trial.postTrialAmount.toString());
      await db.update(trials).set({
        status: "cancelled", cancellationStatus: "completed", cancelledAt: new Date(),
        cancellationMethod: input.method || "manual", cancellationNotes: input.notes || "", moneySaved: amountSaved.toFixed(2),
      }).where(eq(trials.id, input.id));
      await db.insert(savingsRecords).values({
        userId: ctx.user.id, trialId: input.id, serviceName: trial.serviceName,
        amountSaved: amountSaved.toFixed(2), currency: trial.postTrialCurrency, method: input.method || "manual", notes: input.notes || "",
      });
      await db.insert(activityLogs).values({
        userId: ctx.user.id, trialId: input.id, actionType: "trial_cancelled", serviceName: trial.serviceName,
        details: `Cancelled ${trial.serviceName} — saved ${trial.postTrialCurrency} ${amountSaved.toFixed(2)}`,
        metadata: JSON.stringify({ method: input.method, amountSaved }),
      });
      return { success: true, moneySaved: amountSaved };
    }),

  delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.delete(trials).where(and(eq(trials.id, input.id), eq(trials.userId, ctx.user.id)));
    return { success: true };
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allTrials = await db.select().from(trials).where(eq(trials.userId, ctx.user.id));
    const activeTrials = allTrials.filter((t) => ["active", "expiring_soon", "ending_tomorrow"].includes(t.status));
    const cancelledTrials = allTrials.filter((t) => t.status === "cancelled");
    const now = new Date();
    const expiringSoon = activeTrials.filter((t) => {
      const daysLeft = Math.ceil((new Date(t.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    });
    const totalSaved = cancelledTrials.reduce((sum, t) => sum + parseFloat(t.moneySaved.toString()), 0);
    const autoCancelCount = activeTrials.filter((t) => t.autoCancelEnabled).length;
    return { totalTrials: allTrials.length, activeCount: activeTrials.length, cancelledCount: cancelledTrials.length, expiringSoonCount: expiringSoon.length, totalSaved, autoCancelCount };
  }),
});
