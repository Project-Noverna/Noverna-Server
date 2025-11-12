// Guard: Prevent client-side execution
if (!IsDuplicityVersion()) {
	throw new Error("@noverna/database can only be used on the server side.");
}

export type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Re-export commonly used Drizzle utilities
export { and, asc, between, desc, eq, ilike, inArray, isNotNull, isNull, like, not, or, sql } from "drizzle-orm";

// Export specific table types for type-safe queries
export type {
	accountIdentifiers,
	// Core
	accounts,
	// Audit
	auditLogs,
	bans,
	// Businesses
	businesses,
	businessMemberships,
	businessRoles,
	characterAppearances,
	characterFlags,
	characterJobs,
	// Characters
	characters,
	// Configs
	configs,
	// Economy
	economyLedger,
	// Vehicles
	garages,
	inventories,
	inventoryItems,
	// Inventory
	itemTemplates,
	jobGrades,
	// Jobs
	jobs,
	permissions,
	phoneCalls,
	phoneContacts,
	phoneMessages,
	// Phone
	phoneNumbers,
	// Sessions
	playSessions,
	// Housing
	properties,
	propertyKeys,
	propertyLogs,
	propertyOwnerships,
	propertyUnits,
	roleAssignments,
	rolePermissions,
	// RBAC
	roles,
	vehicleKeys,
	vehicleLogs,
	vehicles,
	whitelistEntries,
} from "../schema";

// Export schema types and tables for queries
export * as schema from "../schema";

// Export enums for use in application code
export {
	characterGender,
	currencyType,
	garageType,
	identifierType,
	inventoryOwnerType,
	inventoryType,
	phoneCallStatus,
	propertyType,
	vehicleState,
	whitelistStatus,
} from "../schema/common/enums";

// Export database service
export * from "./handler/DatabaseService";
