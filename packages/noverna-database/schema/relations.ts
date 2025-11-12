import { relations } from "drizzle-orm";
import { businesses, businessMemberships, businessRoles } from "./businesses/businesses";
import { characterAppearances, characterFlags, characters } from "./characters/characters";
// Import all tables
import { accountIdentifiers, accounts, bans, whitelistEntries } from "./core/accounts";
import { economyLedger } from "./economy/economy";
import { properties, propertyKeys, propertyLogs, propertyOwnerships, propertyUnits } from "./housing/housing";
import { inventories, inventoryItems, itemTemplates } from "./inventory/inventory";
import { characterJobs, jobGrades, jobs } from "./jobs/jobs";
import { phoneCalls, phoneContacts, phoneMessages, phoneNumbers } from "./phone/phone";
import { permissions, roleAssignments, rolePermissions, roles } from "./rbac/rbac";
import { playSessions } from "./sessions/sessions";
import { garages, vehicleKeys, vehicleLogs, vehicles } from "./vehicles/vehicles";

// -----------------------------
// Core relations
// -----------------------------

export const accountsRelations = relations(accounts, ({ many }) => ({
	identifiers: many(accountIdentifiers),
	characters: many(characters),
	roles: many(roleAssignments),
	sessions: many(playSessions),
	whitelists: many(whitelistEntries, { relationName: "accountWhitelists" }),
	reviewedWhitelists: many(whitelistEntries, { relationName: "reviewerWhitelists" }),
	ownBans: many(bans, { relationName: "accountBans" }),
	issuedBans: many(bans, { relationName: "issuedBans" }),
	revokedBans: many(bans, { relationName: "revokedBans" }),
}));

export const accountIdentifiersRelations = relations(accountIdentifiers, ({ one }) => ({
	account: one(accounts, {
		fields: [accountIdentifiers.accountId],
		references: [accounts.id],
	}),
}));

export const whitelistEntriesRelations = relations(whitelistEntries, ({ one }) => ({
	account: one(accounts, {
		relationName: "accountWhitelists",
		fields: [whitelistEntries.accountId],
		references: [accounts.id],
	}),
	reviewer: one(accounts, {
		relationName: "reviewerWhitelists",
		fields: [whitelistEntries.reviewerAccountId],
		references: [accounts.id],
	}),
}));

export const bansRelations = relations(bans, ({ one }) => ({
	account: one(accounts, {
		relationName: "accountBans",
		fields: [bans.accountId],
		references: [accounts.id],
	}),
	issuedBy: one(accounts, {
		relationName: "issuedBans",
		fields: [bans.issuedByAccountId],
		references: [accounts.id],
	}),
	revokedBy: one(accounts, {
		relationName: "revokedBans",
		fields: [bans.revokedByAccountId],
		references: [accounts.id],
	}),
}));

// -----------------------------
// RBAC relations
// -----------------------------

export const rolesRelations = relations(roles, ({ many }) => ({
	assignments: many(roleAssignments),
	permissions: many(rolePermissions),
}));

export const roleAssignmentsRelations = relations(roleAssignments, ({ one }) => ({
	role: one(roles, { fields: [roleAssignments.roleId], references: [roles.id] }),
	account: one(accounts, { fields: [roleAssignments.accountId], references: [accounts.id] }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
	roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
	permission: one(permissions, {
		fields: [rolePermissions.permissionName],
		references: [permissions.name],
	}),
}));

// -----------------------------
// Session relations
// -----------------------------

export const playSessionsRelations = relations(playSessions, ({ one }) => ({
	account: one(accounts, {
		fields: [playSessions.accountId],
		references: [accounts.id],
	}),
}));

// -----------------------------
// Character relations
// -----------------------------

export const charactersRelations = relations(characters, ({ one, many }) => ({
	account: one(accounts, {
		fields: [characters.accountId],
		references: [accounts.id],
	}),
	jobs: many(characterJobs),
	appearance: one(characterAppearances),
	flags: many(characterFlags),
}));

export const characterAppearancesRelations = relations(characterAppearances, ({ one }) => ({
	character: one(characters, { fields: [characterAppearances.characterId], references: [characters.id] }),
}));

export const characterFlagsRelations = relations(characterFlags, ({ one }) => ({
	character: one(characters, { fields: [characterFlags.characterId], references: [characters.id] }),
}));

// -----------------------------
// Job relations
// -----------------------------

export const jobsRelations = relations(jobs, ({ many }) => ({
	grades: many(jobGrades),
	characterJobs: many(characterJobs),
}));

export const jobGradesRelations = relations(jobGrades, ({ one, many }) => ({
	job: one(jobs, {
		fields: [jobGrades.jobId],
		references: [jobs.id],
	}),
	characterJobs: many(characterJobs),
}));

export const characterJobsRelations = relations(characterJobs, ({ one }) => ({
	character: one(characters, {
		fields: [characterJobs.characterId],
		references: [characters.id],
	}),
	job: one(jobs, {
		fields: [characterJobs.jobId],
		references: [jobs.id],
	}),
	grade: one(jobGrades, {
		fields: [characterJobs.jobGradeId],
		references: [jobGrades.id],
	}),
}));

// -----------------------------
// Business relations
// -----------------------------

export const businessesRelations = relations(businesses, ({ many }) => ({
	roles: many(businessRoles),
	members: many(businessMemberships),
}));

export const businessRolesRelations = relations(businessRoles, ({ one, many }) => ({
	business: one(businesses, { fields: [businessRoles.businessId], references: [businesses.id] }),
	members: many(businessMemberships),
}));

export const businessMembershipsRelations = relations(businessMemberships, ({ one }) => ({
	business: one(businesses, { fields: [businessMemberships.businessId], references: [businesses.id] }),
	account: one(accounts, { fields: [businessMemberships.accountId], references: [accounts.id] }),
	role: one(businessRoles, { fields: [businessMemberships.roleId], references: [businessRoles.id] }),
}));

// -----------------------------
// Vehicle relations
// -----------------------------

export const garagesRelations = relations(garages, ({ many }) => ({
	vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
	garage: one(garages, { fields: [vehicles.garageId], references: [garages.id] }),
	ownerAccount: one(accounts, {
		relationName: "vehicleOwnerAccount",
		fields: [vehicles.accountId],
		references: [accounts.id],
	}),
	ownerCharacter: one(characters, {
		relationName: "vehicleOwnerCharacter",
		fields: [vehicles.characterId],
		references: [characters.id],
	}),
	ownerBusiness: one(businesses, {
		relationName: "vehicleOwnerBusiness",
		fields: [vehicles.businessId],
		references: [businesses.id],
	}),
	keys: many(vehicleKeys),
	logs: many(vehicleLogs),
}));

export const vehicleKeysRelations = relations(vehicleKeys, ({ one }) => ({
	vehicle: one(vehicles, { fields: [vehicleKeys.vehicleId], references: [vehicles.id] }),
	account: one(accounts, {
		relationName: "vehicleKeyAccount",
		fields: [vehicleKeys.accountId],
		references: [accounts.id],
	}),
}));

export const vehicleLogsRelations = relations(vehicleLogs, ({ one }) => ({
	vehicle: one(vehicles, { fields: [vehicleLogs.vehicleId], references: [vehicles.id] }),
	actor: one(accounts, {
		relationName: "vehicleLogActor",
		fields: [vehicleLogs.actorAccountId],
		references: [accounts.id],
	}),
}));

// -----------------------------
// Economy relations
// -----------------------------

export const economyLedgerRelations = relations(economyLedger, ({ one }) => ({
	actor: one(accounts, {
		relationName: "economyActor",
		fields: [economyLedger.actorAccountId],
		references: [accounts.id],
	}),
	sourceCharacter: one(characters, {
		relationName: "economySourceCharacter",
		fields: [economyLedger.sourceCharacterId],
		references: [characters.id],
	}),
	sourceBusiness: one(businesses, {
		relationName: "economySourceBusiness",
		fields: [economyLedger.sourceBusinessId],
		references: [businesses.id],
	}),
	targetCharacter: one(characters, {
		relationName: "economyTargetCharacter",
		fields: [economyLedger.targetCharacterId],
		references: [characters.id],
	}),
	targetBusiness: one(businesses, {
		relationName: "economyTargetBusiness",
		fields: [economyLedger.targetBusinessId],
		references: [businesses.id],
	}),
}));

// -----------------------------
// Inventory relations
// -----------------------------

export const itemTemplatesRelations = relations(itemTemplates, ({ many }) => ({
	items: many(inventoryItems),
}));

export const inventoriesRelations = relations(inventories, ({ one, many }) => ({
	ownerAccount: one(accounts, {
		relationName: "inventoryOwnerAccount",
		fields: [inventories.ownerAccountId],
		references: [accounts.id],
	}),
	ownerCharacter: one(characters, {
		relationName: "inventoryOwnerCharacter",
		fields: [inventories.ownerCharacterId],
		references: [characters.id],
	}),
	ownerBusiness: one(businesses, {
		relationName: "inventoryOwnerBusiness",
		fields: [inventories.ownerBusinessId],
		references: [businesses.id],
	}),
	items: many(inventoryItems),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
	inventory: one(inventories, { fields: [inventoryItems.inventoryId], references: [inventories.id] }),
	template: one(itemTemplates, { fields: [inventoryItems.templateId], references: [itemTemplates.id] }),
}));

// -----------------------------
// Housing relations
// -----------------------------

export const propertiesRelations = relations(properties, ({ many }) => ({
	units: many(propertyUnits),
}));

export const propertyUnitsRelations = relations(propertyUnits, ({ one, many }) => ({
	property: one(properties, { fields: [propertyUnits.propertyId], references: [properties.id] }),
	ownerships: many(propertyOwnerships),
	keys: many(propertyKeys),
	logs: many(propertyLogs),
}));

export const propertyOwnershipsRelations = relations(propertyOwnerships, ({ one }) => ({
	unit: one(propertyUnits, { fields: [propertyOwnerships.unitId], references: [propertyUnits.id] }),
	account: one(accounts, {
		relationName: "propertyOwnerAccount",
		fields: [propertyOwnerships.accountId],
		references: [accounts.id],
	}),
	character: one(characters, {
		relationName: "propertyOwnerCharacter",
		fields: [propertyOwnerships.characterId],
		references: [characters.id],
	}),
}));

export const propertyKeysRelations = relations(propertyKeys, ({ one }) => ({
	unit: one(propertyUnits, { fields: [propertyKeys.unitId], references: [propertyUnits.id] }),
	account: one(accounts, {
		relationName: "propertyKeyAccount",
		fields: [propertyKeys.accountId],
		references: [accounts.id],
	}),
	character: one(characters, {
		relationName: "propertyKeyCharacter",
		fields: [propertyKeys.characterId],
		references: [characters.id],
	}),
}));

export const propertyLogsRelations = relations(propertyLogs, ({ one }) => ({
	unit: one(propertyUnits, { fields: [propertyLogs.unitId], references: [propertyUnits.id] }),
	actorAccount: one(accounts, {
		relationName: "propertyLogAccount",
		fields: [propertyLogs.actorAccountId],
		references: [accounts.id],
	}),
	actorCharacter: one(characters, {
		relationName: "propertyLogCharacter",
		fields: [propertyLogs.actorCharacterId],
		references: [characters.id],
	}),
}));

// -----------------------------
// Phone relations
// -----------------------------

export const phoneNumbersRelations = relations(phoneNumbers, ({ one, many }) => ({
	character: one(characters, { fields: [phoneNumbers.characterId], references: [characters.id] }),
	contacts: many(phoneContacts),
	messagesFrom: many(phoneMessages, { relationName: "fromNumber" }),
	messagesTo: many(phoneMessages, { relationName: "toNumber" }),
	callsFrom: many(phoneCalls, { relationName: "callFromNumber" }),
	callsTo: many(phoneCalls, { relationName: "callToNumber" }),
}));

export const phoneContactsRelations = relations(phoneContacts, ({ one }) => ({
	owner: one(phoneNumbers, { fields: [phoneContacts.ownerNumberId], references: [phoneNumbers.id] }),
}));

export const phoneMessagesRelations = relations(phoneMessages, ({ one }) => ({
	from: one(phoneNumbers, {
		relationName: "fromNumber",
		fields: [phoneMessages.fromNumberId],
		references: [phoneNumbers.id],
	}),
	to: one(phoneNumbers, {
		relationName: "toNumber",
		fields: [phoneMessages.toNumberId],
		references: [phoneNumbers.id],
	}),
}));

export const phoneCallsRelations = relations(phoneCalls, ({ one }) => ({
	from: one(phoneNumbers, {
		relationName: "callFromNumber",
		fields: [phoneCalls.fromNumberId],
		references: [phoneNumbers.id],
	}),
	to: one(phoneNumbers, {
		relationName: "callToNumber",
		fields: [phoneCalls.toNumberId],
		references: [phoneNumbers.id],
	}),
}));
