import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { characterGender } from "../common/enums";
import { accounts } from "../core/accounts";

export const characters = pgTable(
	"characters",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),

		// Human-friendly character identifier (e.g., "NOA-12345")
		cid: text("cid").notNull(),

		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		gender: characterGender("gender").notNull(),
		dateOfBirth: text("date_of_birth"), // store as string YYYY-MM-DD for simplicity

		cash: integer("cash").notNull().default(0),
		bank: integer("bank").notNull().default(0),

		position: jsonb("position").$type<Record<string, unknown>>().default({}),
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

		isDeleted: boolean("is_deleted").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		cidUnique: uniqueIndex("characters_cid_unique").on(t.cid),
		accountIdx: index("characters_account_idx").on(t.accountId),
	}),
);

export const characterAppearances = pgTable(
	"character_appearances",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		characterId: uuid("character_id")
			.notNull()
			.references(() => characters.id, { onDelete: "cascade" }),
		pedModel: text("ped_model").notNull(),
		components: jsonb("components").$type<Record<string, unknown>>().default({}),
		overlays: jsonb("overlays").$type<Record<string, unknown>>().default({}),
		props: jsonb("props").$type<Record<string, unknown>>().default({}),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueCharacter: uniqueIndex("character_appearances_character_unique").on(t.characterId) }),
);

export const characterFlags = pgTable(
	"character_flags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		characterId: uuid("character_id")
			.notNull()
			.references(() => characters.id, { onDelete: "cascade" }),
		key: text("key").notNull(),
		value: jsonb("value").$type<Record<string, unknown>>().default({}),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueFlag: uniqueIndex("character_flags_unique").on(t.characterId, t.key) }),
);
