import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { propnexusAiQueryHistory, propnexusSavedSearches } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";

const criteriaSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));
const savedSearchSchema = z.object({ searchKey: z.string().min(1).max(128), label: z.string().trim().min(1).max(180), criteria: criteriaSchema });

export const syncRouter = router({
  savedSearches: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(propnexusSavedSearches).where(eq(propnexusSavedSearches.userKey, ctx.user.openId)).orderBy(desc(propnexusSavedSearches.updatedAt)).limit(8);
  }),

  upsertSavedSearch: protectedProcedure.input(savedSearchSchema).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return { synced: false as const };
    const criteria = JSON.stringify(input.criteria);
    const existing = await db.select({ id: propnexusSavedSearches.id }).from(propnexusSavedSearches).where(and(eq(propnexusSavedSearches.userKey, ctx.user.openId), eq(propnexusSavedSearches.searchKey, input.searchKey))).limit(1);
    if (existing[0]) {
      await db.update(propnexusSavedSearches).set({ label: input.label, criteria }).where(eq(propnexusSavedSearches.id, existing[0].id));
    } else {
      await db.insert(propnexusSavedSearches).values({ userKey: ctx.user.openId, searchKey: input.searchKey, label: input.label, criteria });
    }
    return { synced: true as const };
  }),

  deleteSavedSearch: protectedProcedure.input(z.object({ searchKey: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return { synced: false as const };
    await db.delete(propnexusSavedSearches).where(and(eq(propnexusSavedSearches.userKey, ctx.user.openId), eq(propnexusSavedSearches.searchKey, input.searchKey)));
    return { synced: true as const };
  }),

  queryHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select({ query: propnexusAiQueryHistory.query }).from(propnexusAiQueryHistory).where(eq(propnexusAiQueryHistory.userKey, ctx.user.openId)).orderBy(desc(propnexusAiQueryHistory.createdAt)).limit(5);
  }),

  upsertQuery: protectedProcedure.input(z.object({ query: z.string().trim().min(3).max(500) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return { synced: false as const };
    const query = input.query.trim();
    const queryKey = query.toLowerCase();
    const existing = await db.select({ id: propnexusAiQueryHistory.id }).from(propnexusAiQueryHistory).where(and(eq(propnexusAiQueryHistory.userKey, ctx.user.openId), eq(propnexusAiQueryHistory.queryKey, queryKey))).limit(1);
    if (existing[0]) await db.update(propnexusAiQueryHistory).set({ query, createdAt: new Date() }).where(eq(propnexusAiQueryHistory.id, existing[0].id));
    else await db.insert(propnexusAiQueryHistory).values({ userKey: ctx.user.openId, query, queryKey });
    return { synced: true as const };
  }),

  clearQueryHistory: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { synced: false as const };
    await db.delete(propnexusAiQueryHistory).where(eq(propnexusAiQueryHistory.userKey, ctx.user.openId));
    return { synced: true as const };
  }),
});
