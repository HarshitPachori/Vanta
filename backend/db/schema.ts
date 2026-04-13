import { sqliteTable } from "drizzle-orm/sqlite-core";

export const Integrations = sqliteTable('integrations',{});

export type Integration = typeof Integrations.$inferSelect;