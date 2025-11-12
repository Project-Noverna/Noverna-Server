/**
 * Drizzle ORM Schema Entry Point
 * 
 * This file re-exports all schema definitions from modular files.
 * The schema is organized by domain for better maintainability:
 * 
 * - common/enums.ts: All PostgreSQL enums
 * - core/accounts.ts: Account management, identifiers, whitelist, bans
 * - rbac/rbac.ts: Role-based access control
 * - characters/characters.ts: Characters and appearance
 * - jobs/jobs.ts: Job system and character assignments
 * - sessions/sessions.ts: Play session tracking
 * - audit/audit.ts: Audit logging
 * - businesses/businesses.ts: Business management
 * - vehicles/vehicles.ts: Vehicle and garage system
 * - configs/configs.ts: Server configuration storage
 * - economy/economy.ts: Economy transaction ledger
 * - inventory/inventory.ts: Item and inventory system
 * - housing/housing.ts: Property and housing system
 * - phone/phone.ts: Phone and messaging system
 * - relations.ts: All Drizzle relations for query ergonomics
 */

export * from "./index";
