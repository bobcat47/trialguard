import { relations } from "drizzle-orm";
import { users, trials, services, cancelGuides, savingsRecords, activityLogs } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  trials: many(trials),
  savingsRecords: many(savingsRecords),
  activityLogs: many(activityLogs),
}));

export const trialsRelations = relations(trials, ({ one, many }) => ({
  user: one(users, { fields: [trials.userId], references: [users.id] }),
  savingsRecords: many(savingsRecords),
  activityLogs: many(activityLogs),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  cancelGuides: many(cancelGuides),
}));

export const cancelGuidesRelations = relations(cancelGuides, ({ one }) => ({
  service: one(services, { fields: [cancelGuides.serviceId], references: [services.id] }),
}));

export const savingsRecordsRelations = relations(savingsRecords, ({ one }) => ({
  user: one(users, { fields: [savingsRecords.userId], references: [users.id] }),
  trial: one(trials, { fields: [savingsRecords.trialId], references: [trials.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  trial: one(trials, { fields: [activityLogs.trialId], references: [trials.id] }),
}));
