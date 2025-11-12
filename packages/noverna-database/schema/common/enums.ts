import { pgEnum } from "drizzle-orm/pg-core";

// Core identifier types
export const identifierType = pgEnum("identifier_type", ["steam", "license", "discord", "fivem", "xbl", "liveid", "ip", "hwid"]);

// Whitelist status
export const whitelistStatus = pgEnum("whitelist_status", ["pending", "approved", "denied", "revoked"]);

// Character enums
export const characterGender = pgEnum("character_gender", ["male", "female", "other"]);

// Vehicle enums
export const garageType = pgEnum("garage_type", ["public", "private", "business", "impound"]);
export const vehicleState = pgEnum("vehicle_state", ["stored", "out", "impounded"]);

// Economy enums
export const currencyType = pgEnum("currency_type", ["cash", "bank"]);

// Property enums
export const propertyType = pgEnum("property_type", ["apartment", "house", "business_prop", "garage"]);

// Phone enums
export const phoneCallStatus = pgEnum("phone_call_status", ["missed", "completed", "declined"]);

// Inventory enums
export const inventoryOwnerType = pgEnum("inventory_owner_type", ["character", "account", "business", "world"]);
export const inventoryType = pgEnum("inventory_type", ["player", "stash", "trunk", "glovebox", "property", "drop"]);
