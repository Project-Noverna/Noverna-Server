import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { identifierType, whitelistStatus } from "../common/enums";

export const accounts = pgTable(
	"accounts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),

		username: text("username"),
		displayName: text("display_name"),
		email: text("email"),

		// Global flags / preferences (auditable, not for secrets)
		flags: jsonb("flags").$type<Record<string, unknown>>().default({}),

		// Quick booleans for access decisions
		isActive: boolean("is_active").notNull().default(true),
	},
	(t) => ({
		emailUnique: uniqueIndex("accounts_email_unique").on(t.email),
		usernameIdx: index("accounts_username_idx").on(t.username),
		sessionIdx: index("accounts_session_idx").on(t.isActive),
		whitelistIdx: index("accounts_whitelist_idx").on(t.isActive),
	}),
);

export const accountIdentifiers = pgTable(
	"account_identifiers",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),

		type: identifierType("type").notNull(),
		value: text("value").notNull(),

		firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
		lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({
		typeValueUnique: uniqueIndex("account_identifiers_type_value_unique").on(t.type, t.value),
		accountIdx: index("account_identifiers_account_idx").on(t.accountId),
		valueIdx: index("account_identifiers_value_idx").on(t.value),
	}),
);

export const whitelistEntries = pgTable(
	"whitelists",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		status: whitelistStatus("status").notNull().default("pending"),
		reason: text("reason"),
		reviewerAccountId: uuid("reviewer_account_id").references(() => accounts.id),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		accountUnique: uniqueIndex("whitelists_account_unique").on(t.accountId),
		statusIdx: index("whitelists_status_idx").on(t.status),
	}),
);

export const bans = pgTable(
	"bans",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),

		// Allow identifier-based bans (for offline bans)
		identifierType: identifierType("identifier_type"),
		identifierValue: text("identifier_value"),

		scope: text("scope").notNull().default("global"),
		reason: text("reason"),
		issuedByAccountId: uuid("issued_by_account_id").references(() => accounts.id),
		issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		revokedAt: timestamp("revoked_at", { withTimezone: true }),
		revokedByAccountId: uuid("revoked_by_account_id").references(() => accounts.id),
		meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
	},
	(t) => ({
		activeIdx: index("bans_active_idx").on(t.expiresAt, t.revokedAt),
		accountIdx: index("bans_account_idx").on(t.accountId),
		identifierIdx: index("bans_identifier_idx").on(t.identifierType, t.identifierValue),
	}),
);
