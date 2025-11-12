import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const configs = pgTable(
	"configs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		namespace: text("namespace").notNull().default("core"),
		key: text("key").notNull(),
		value: jsonb("value").$type<Record<string, unknown>>().default({}),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueKey: uniqueIndex("configs_namespace_key_unique").on(t.namespace, t.key) }),
);
