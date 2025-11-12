import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accounts } from "../core/accounts";

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		actorAccountId: uuid("actor_account_id").references(() => accounts.id),
		action: text("action").notNull(), // e.g., "ban.create"
		targetType: text("target_type"), // e.g., "account", "character"
		targetId: text("target_id"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ actorIdx: index("audit_logs_actor_idx").on(t.actorAccountId) }),
);
