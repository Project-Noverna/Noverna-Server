import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { accounts } from "../core/accounts";

export const roles = pgTable(
	"roles",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("roles_name_unique").on(t.name) }),
);

export const permissions = pgTable("permissions", {
	name: text("name").primaryKey(),
	description: text("description"),
});

export const roleAssignments = pgTable(
	"role_assignments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
		assignedByAccountId: uuid("assigned_by_account_id").references(() => accounts.id),
	},
	(t) => ({
		uniqueAssignment: uniqueIndex("role_assignments_unique").on(t.accountId, t.roleId),
		accountIdx: index("role_assignments_account_idx").on(t.accountId),
	}),
);

export const rolePermissions = pgTable(
	"role_permissions",
	{
		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionName: text("permission_name")
			.notNull()
			.references(() => permissions.name, { onDelete: "cascade" }),
	},
	(t) => ({
		rolePermUnique: uniqueIndex("role_permissions_unique").on(t.roleId, t.permissionName),
	}),
);
