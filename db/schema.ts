import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const usageWindows = sqliteTable('usage_windows', {
  key: text('key').primaryKey(),
  used: integer('used').notNull().default(0),
});
