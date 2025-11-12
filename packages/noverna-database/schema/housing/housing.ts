import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { characters } from "../characters/characters";
import { propertyType } from "../common/enums";
import { accounts } from "../core/accounts";
import { inventories } from "../inventory/inventory";

export const properties = pgTable(
	"properties",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(), // internal name
		label: text("label").notNull(),
		type: propertyType("type").notNull().default("house"),
		position: jsonb("position").$type<Record<string, unknown>>().default({}),
		interiorId: text("interior_id"),
		price: integer("price").notNull().default(0),
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("properties_name_unique").on(t.name) }),
);

export const propertyUnits = pgTable(
	"property_units",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		propertyId: uuid("property_id")
			.notNull()
			.references(() => properties.id, { onDelete: "cascade" }),
		unitNumber: text("unit_number").notNull(),
		entrancePosition: jsonb("entrance_position").$type<Record<string, unknown>>().default({}),
		storageInventoryId: uuid("storage_inventory_id").references(() => inventories.id, { onDelete: "set null" }),
	},
	(t) => ({ uniqueUnit: uniqueIndex("property_units_unique").on(t.propertyId, t.unitNumber) }),
);

export const propertyOwnerships = pgTable(
	"property_ownerships",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		unitId: uuid("unit_id")
			.notNull()
			.references(() => propertyUnits.id, { onDelete: "cascade" }),
		accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
		characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }),
		isOwner: boolean("is_owner").notNull().default(true),
		rent: integer("rent").notNull().default(0),
		active: boolean("active").notNull().default(true),
		startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
		endedAt: timestamp("ended_at", { withTimezone: true }),
	},
	(t) => ({
		unitIdx: index("property_ownerships_unit_idx").on(t.unitId),
		accountIdx: index("property_ownerships_account_idx").on(t.accountId),
		characterIdx: index("property_ownerships_character_idx").on(t.characterId),
	}),
);

export const propertyKeys = pgTable(
	"property_keys",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		unitId: uuid("unit_id")
			.notNull()
			.references(() => propertyUnits.id, { onDelete: "cascade" }),
		accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
		characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueKey: uniqueIndex("property_keys_unique").on(t.unitId, t.accountId, t.characterId) }),
);

export const propertyLogs = pgTable(
	"property_logs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		unitId: uuid("unit_id")
			.notNull()
			.references(() => propertyUnits.id, { onDelete: "cascade" }),
		action: text("action").notNull(), // lock/unlock/enter/exit/transfer
		actorAccountId: uuid("actor_account_id").references(() => accounts.id),
		actorCharacterId: uuid("actor_character_id").references(() => characters.id),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ unitIdx: index("property_logs_unit_idx").on(t.unitId) }),
);
