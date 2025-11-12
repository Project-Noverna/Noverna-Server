import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accounts } from "../core/accounts";

export const playSessions = pgTable(
	"play_sessions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
		endedAt: timestamp("ended_at", { withTimezone: true }),
		lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
		sourceIp: text("source_ip"),
		endedReason: text("ended_reason"),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ accountIdx: index("play_sessions_account_idx").on(t.accountId) }),
);
