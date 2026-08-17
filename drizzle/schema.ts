import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const propnexusSavedSearches = mysqlTable("propnexus_saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userKey: varchar("userKey", { length: 128 }).notNull(),
  searchKey: varchar("searchKey", { length: 128 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  criteria: text("criteria").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ ownerSearchUnique: uniqueIndex("propnexus_saved_searches_owner_search_unique").on(table.userKey, table.searchKey) }));

export const propnexusAiQueryHistory = mysqlTable("propnexus_ai_query_history", {
  id: int("id").autoincrement().primaryKey(),
  userKey: varchar("userKey", { length: 128 }).notNull(),
  query: text("query").notNull(),
  queryKey: varchar("queryKey", { length: 180 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ ownerQueryUnique: uniqueIndex("propnexus_ai_query_history_owner_query_unique").on(table.userKey, table.queryKey) }));

export type PropnexusSavedSearch = typeof propnexusSavedSearches.$inferSelect;
export type PropnexusAiQueryHistory = typeof propnexusAiQueryHistory.$inferSelect;
