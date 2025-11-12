import { boolean, index, integer, jsonb, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { businesses } from "../businesses/businesses";
import { characters } from "../characters/characters";
import { inventoryOwnerType, inventoryType } from "../common/enums";
import { accounts } from "../core/accounts";

export const itemTemplates = pgTable(
	"item_templates",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(), // internal name (e.g., bread)
		label: text("label").notNull(),
		weight: integer("weight").notNull().default(0), // grams
		stackable: boolean("stackable").notNull().default(true),
		maxStack: integer("max_stack").notNull().default(100),
		usable: boolean("usable").notNull().default(false),
		useEffects: jsonb("use_effects").$type<Record<string, unknown>>().default({}),
		metadataSchema: jsonb("metadata_schema").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("item_templates_name_unique").on(t.name) }),
);

export const inventories = pgTable(
	"inventories",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		ownerType: inventoryOwnerType("owner_type").notNull().default("character"),
		ownerAccountId: uuid("owner_account_id").references(() => accounts.id, { onDelete: "set null" }),
		ownerCharacterId: uuid("owner_character_id").references(() => characters.id, { onDelete: "set null" }),
		ownerBusinessId: uuid("owner_business_id").references(() => businesses.id, { onDelete: "set null" }),
		type: inventoryType("type").notNull().default("player"),
		capacity: integer("capacity").notNull().default(50), // slots
		weightLimit: integer("weight_limit").notNull().default(30000), // grams
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		ownerIdx: index("inventories_owner_idx").on(t.ownerType, t.ownerAccountId, t.ownerCharacterId, t.ownerBusinessId),
		typeIdx: index("inventories_type_idx").on(t.type),
	}),
);

export const inventoryItems = pgTable(
	"inventory_items",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		inventoryId: uuid("inventory_id")
			.notNull()
			.references(() => inventories.id, { onDelete: "cascade" }),
		templateId: uuid("template_id")
			.notNull()
			.references(() => itemTemplates.id, { onDelete: "restrict" }),
		quantity: integer("quantity").notNull().default(1),
		slot: smallint("slot").notNull().default(0),
		durability: smallint("durability").notNull().default(100),
		customWeight: integer("custom_weight"), // optional override
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		slotUnique: uniqueIndex("inventory_items_slot_unique").on(t.inventoryId, t.slot),
		templateIdx: index("inventory_items_template_idx").on(t.templateId),
	}),
);
