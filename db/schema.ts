import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const trials = mysqlTable("trials", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  serviceName: varchar("serviceName", { length: 100 }).notNull(),
  planName: varchar("planName", { length: 100 }).default("").notNull(),
  serviceCategory: varchar("serviceCategory", { length: 50 }).default("other").notNull(),
  serviceBrandColor: varchar("serviceBrandColor", { length: 7 }).default("#6366F1"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  trialLengthDays: int("trialLengthDays").default(7).notNull(),
  postTrialAmount: decimal("postTrialAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  postTrialCurrency: varchar("postTrialCurrency", { length: 3 }).default("GBP").notNull(),
  postTrialPeriod: varchar("postTrialPeriod", { length: 20 }).default("monthly").notNull(),
  source: mysqlEnum("source", ["manual", "email_scan", "import"]).default("manual").notNull(),
  status: mysqlEnum("status", [
    "active",
    "expiring_soon",
    "ending_tomorrow",
    "cancelled",
    "expired",
    "charged",
  ]).default("active").notNull(),
  cancellationStatus: mysqlEnum("cancellationStatus", [
    "not_started",
    "in_progress",
    "completed",
    "failed",
  ]).default("not_started").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancellationMethod: varchar("cancellationMethod", { length: 50 }),
  cancellationNotes: text("cancellationNotes"),
  moneySaved: decimal("moneySaved", { precision: 10, scale: 2 }).default("0.00").notNull(),
  autoCancelEnabled: boolean("autoCancelEnabled").default(false).notNull(),
  autoCancelTiming: int("autoCancelTiming").default(24).notNull(),
  autoCancelRequiresApproval: boolean("autoCancelRequiresApproval").default(true).notNull(),
  autoCancelStatus: mysqlEnum("autoCancelStatus", [
    "not_queued",
    "queued",
    "pending_approval",
    "processing",
    "completed",
    "failed",
  ]).default("not_queued").notNull(),
  notes: text("notes"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Trial = typeof trials.$inferSelect;
export type InsertTrial = typeof trials.$inferInsert;

export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).default("other").notNull(),
  brandColor: varchar("brandColor", { length: 7 }).default("#6366F1").notNull(),
  cancelUrl: text("cancelUrl"),
  cancelDifficulty: mysqlEnum("cancelDifficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  cancelMethod: mysqlEnum("cancelMethod", ["self_service", "contact_support", "both"]).default("self_service").notNull(),
  supportPhone: varchar("supportPhone", { length: 30 }),
  supportEmail: varchar("supportEmail", { length: 255 }),
  supportChatUrl: text("supportChatUrl"),
  typicalPrice: decimal("typicalPrice", { precision: 10, scale: 2 }),
  typicalCurrency: varchar("typicalCurrency", { length: 3 }).default("GBP"),
  typicalPeriod: varchar("typicalPeriod", { length: 20 }).default("monthly"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export const cancelGuides = mysqlTable("cancelGuides", {
  id: serial("id").primaryKey(),
  serviceId: bigint("serviceId", { mode: "number", unsigned: true }).notNull(),
  stepNumber: int("stepNumber").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  tip: text("tip"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CancelGuide = typeof cancelGuides.$inferSelect;

export const savingsRecords = mysqlTable("savingsRecords", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  trialId: bigint("trialId", { mode: "number", unsigned: true }),
  serviceName: varchar("serviceName", { length: 100 }).notNull(),
  amountSaved: decimal("amountSaved", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  method: varchar("method", { length: 50 }),
  notes: text("notes"),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type SavingsRecord = typeof savingsRecords.$inferSelect;

export const activityLogs = mysqlTable("activityLogs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  trialId: bigint("trialId", { mode: "number", unsigned: true }),
  actionType: mysqlEnum("actionType", [
    "trial_added",
    "trial_cancelled",
    "trial_expired",
    "trial_detected",
    "auto_cancel_triggered",
    "auto_cancel_completed",
    "auto_cancel_failed",
    "money_saved",
    "email_connected",
    "email_scanned",
    "settings_changed",
  ]).notNull(),
  serviceName: varchar("serviceName", { length: 100 }),
  details: text("details"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
