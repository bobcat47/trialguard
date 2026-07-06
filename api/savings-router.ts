import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { savingsRecords } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const savingsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(savingsRecords).where(eq(savingsRecords.userId, ctx.user.id)).orderBy(desc(savingsRecords.savedAt));
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allRecords = await db.select().from(savingsRecords).where(eq(savingsRecords.userId, ctx.user.id));
    const totalSaved = allRecords.reduce((sum, r) => sum + parseFloat(r.amountSaved.toString()), 0);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = allRecords.filter((r) => new Date(r.savedAt) >= startOfMonth);
    const monthlySaved = thisMonth.reduce((sum, r) => sum + parseFloat(r.amountSaved.toString()), 0);
    const byService: Record<string, number> = {};
    allRecords.forEach((r) => { byService[r.serviceName] = (byService[r.serviceName] || 0) + parseFloat(r.amountSaved.toString()); });
    const serviceBreakdown = Object.entries(byService).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    return { totalSaved, monthlySaved, totalCount: allRecords.length, thisMonthCount: thisMonth.length, avgSaved: allRecords.length > 0 ? totalSaved / allRecords.length : 0, serviceBreakdown };
  }),

  byMonth: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const records = await db.select().from(savingsRecords).where(eq(savingsRecords.userId, ctx.user.id)).orderBy(savingsRecords.savedAt);
    const monthly: Record<string, number> = {};
    records.forEach((r) => { const d = new Date(r.savedAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; monthly[key] = (monthly[key] || 0) + parseFloat(r.amountSaved.toString()); });
    return Object.entries(monthly).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));
  }),
});
