import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { businesses } from "../businesses/businesses";
import { characters } from "../characters/characters";
import { currencyType } from "../common/enums";
import { accounts } from "../core/accounts";

export const economyLedger = pgTable(
	"economy_ledger",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		currency: currencyType("currency").notNull().default("cash"),
		amount: integer("amount").notNull(), // positive or negative
		reason: text("reason"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

		actorAccountId: uuid("actor_account_id").references(() => accounts.id),
		sourceCharacterId: uuid("source_character_id").references(() => characters.id),
		sourceBusinessId: uuid("source_business_id").references(() => businesses.id),
		targetCharacterId: uuid("target_character_id").references(() => characters.id),
		targetBusinessId: uuid("target_business_id").references(() => businesses.id),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ createdIdx: index("economy_ledger_created_idx").on(t.createdAt) }),
);
