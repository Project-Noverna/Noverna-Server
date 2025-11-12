import { boolean, integer, jsonb, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { accounts } from "../core/accounts";

export const businesses = pgTable(
	"businesses",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		label: text("label").notNull(),
		bankBalance: integer("bank_balance").notNull().default(0),
		metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("businesses_name_unique").on(t.name) }),
);

export const businessRoles = pgTable(
	"business_roles",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		businessId: uuid("business_id")
			.notNull()
			.references(() => businesses.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		label: text("label").notNull(),
		rank: smallint("rank").notNull().default(0),
		permissions: jsonb("permissions").$type<string[]>().default([]),
	},
	(t) => ({
		uniqueByName: uniqueIndex("business_roles_unique_name").on(t.businessId, t.name),
		uniqueByRank: uniqueIndex("business_roles_unique_rank").on(t.businessId, t.rank),
	}),
);

export const businessMemberships = pgTable(
	"business_memberships",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		businessId: uuid("business_id")
			.notNull()
			.references(() => businesses.id, { onDelete: "cascade" }),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		roleId: uuid("role_id")
			.notNull()
			.references(() => businessRoles.id, { onDelete: "restrict" }),
		isOwner: boolean("is_owner").notNull().default(false),
		hiredAt: timestamp("hired_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ uniqueMember: uniqueIndex("business_memberships_unique").on(t.businessId, t.accountId) }),
);
