import { boolean, index, integer, jsonb, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { businesses } from "../businesses/businesses";
import { characters } from "../characters/characters";
import { garageType, vehicleState } from "../common/enums";
import { accounts } from "../core/accounts";

export const garages = pgTable(
	"garages",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		label: text("label").notNull(),
		type: garageType("type").notNull().default("public"),
		position: jsonb("position").$type<Record<string, unknown>>().default({}),
		radius: smallint("radius").notNull().default(5),
		capacity: smallint("capacity").notNull().default(50),
		isImpound: boolean("is_impound").notNull().default(false),
		businessId: uuid("business_id"), // optional, filled for business garages
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("garages_name_unique").on(t.name) }),
);

export const vehicles = pgTable(
	"vehicles",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		plate: text("plate").notNull(),
		model: text("model").notNull(), // model name or hash string

		accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
		characterId: uuid("character_id").references(() => characters.id, { onDelete: "set null" }),
		businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),

		garageId: uuid("garage_id").references(() => garages.id, { onDelete: "set null" }),
		state: vehicleState("state").notNull().default("stored"),
		fuel: smallint("fuel").notNull().default(100),
		health: integer("health").notNull().default(1000),
		properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
		position: jsonb("position").$type<Record<string, unknown>>().default({}),

		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		plateUnique: uniqueIndex("vehicles_plate_unique").on(t.plate),
		ownerIdx: index("vehicles_owner_idx").on(t.accountId, t.characterId, t.businessId),
		garageIdx: index("vehicles_garage_idx").on(t.garageId),
	}),
);

export const vehicleKeys = pgTable(
	"vehicle_keys",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		vehicleId: uuid("vehicle_id")
			.notNull()
			.references(() => vehicles.id, { onDelete: "cascade" }),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		grantedByAccountId: uuid("granted_by_account_id").references(() => accounts.id),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueKey: uniqueIndex("vehicle_keys_unique").on(t.vehicleId, t.accountId) }),
);

export const vehicleLogs = pgTable(
	"vehicle_logs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		vehicleId: uuid("vehicle_id")
			.notNull()
			.references(() => vehicles.id, { onDelete: "cascade" }),
		action: text("action").notNull(), // e.g., spawn/store/impound/lock/unlock/transfer
		actorAccountId: uuid("actor_account_id").references(() => accounts.id),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({ vehicleIdx: index("vehicle_logs_vehicle_idx").on(t.vehicleId) }),
);
