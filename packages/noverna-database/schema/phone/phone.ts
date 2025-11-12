import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { characters } from "../characters/characters";
import { phoneCallStatus } from "../common/enums";

export const phoneNumbers = pgTable(
	"phone_numbers",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		number: text("number").notNull(),
		characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }),
		isPrimary: boolean("is_primary").notNull().default(false),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ numberUnique: uniqueIndex("phone_numbers_number_unique").on(t.number) }),
);

export const phoneContacts = pgTable(
	"phone_contacts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		ownerNumberId: uuid("owner_number_id")
			.notNull()
			.references(() => phoneNumbers.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		number: text("number").notNull(),
	},
	(t) => ({ uniqueContact: uniqueIndex("phone_contacts_unique").on(t.ownerNumberId, t.number) }),
);

export const phoneMessages = pgTable(
	"phone_messages",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		fromNumberId: uuid("from_number_id")
			.notNull()
			.references(() => phoneNumbers.id, { onDelete: "cascade" }),
		toNumberId: uuid("to_number_id")
			.notNull()
			.references(() => phoneNumbers.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		deliveredAt: timestamp("delivered_at", { withTimezone: true }),
		readAt: timestamp("read_at", { withTimezone: true }),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ convoIdx: index("phone_messages_convo_idx").on(t.fromNumberId, t.toNumberId) }),
);

export const phoneCalls = pgTable(
	"phone_calls",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		fromNumberId: uuid("from_number_id")
			.notNull()
			.references(() => phoneNumbers.id, { onDelete: "cascade" }),
		toNumberId: uuid("to_number_id")
			.notNull()
			.references(() => phoneNumbers.id, { onDelete: "cascade" }),
		status: phoneCallStatus("status").notNull().default("missed"),
		startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
		endedAt: timestamp("ended_at", { withTimezone: true }),
		durationSec: integer("duration_sec").notNull().default(0),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ callsIdx: index("phone_calls_idx").on(t.fromNumberId, t.toNumberId, t.startedAt) }),
);
