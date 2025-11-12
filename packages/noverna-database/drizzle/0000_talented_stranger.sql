CREATE TYPE "public"."character_gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."currency_type" AS ENUM('cash', 'bank');--> statement-breakpoint
CREATE TYPE "public"."garage_type" AS ENUM('public', 'private', 'business', 'impound');--> statement-breakpoint
CREATE TYPE "public"."identifier_type" AS ENUM('steam', 'license', 'discord', 'fivem', 'xbl', 'liveid', 'ip', 'hwid');--> statement-breakpoint
CREATE TYPE "public"."inventory_owner_type" AS ENUM('character', 'account', 'business', 'world');--> statement-breakpoint
CREATE TYPE "public"."inventory_type" AS ENUM('player', 'stash', 'trunk', 'glovebox', 'property', 'drop');--> statement-breakpoint
CREATE TYPE "public"."phone_call_status" AS ENUM('missed', 'completed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'house', 'business_prop', 'garage');--> statement-breakpoint
CREATE TYPE "public"."vehicle_state" AS ENUM('stored', 'out', 'impounded');--> statement-breakpoint
CREATE TYPE "public"."whitelist_status" AS ENUM('pending', 'approved', 'denied', 'revoked');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_account_id" uuid,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "business_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"hired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"rank" smallint DEFAULT 0 NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"bank_balance" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_appearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"ped_model" text NOT NULL,
	"components" jsonb DEFAULT '{}'::jsonb,
	"overlays" jsonb DEFAULT '{}'::jsonb,
	"props" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"cid" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"gender" character_gender NOT NULL,
	"date_of_birth" text,
	"cash" integer DEFAULT 0 NOT NULL,
	"bank" integer DEFAULT 0 NOT NULL,
	"position" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"namespace" text DEFAULT 'core' NOT NULL,
	"key" text NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_identifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "identifier_type" NOT NULL,
	"value" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"username" text,
	"display_name" text,
	"email" text,
	"flags" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"identifier_type" "identifier_type",
	"identifier_value" text,
	"scope" text DEFAULT 'global' NOT NULL,
	"reason" text,
	"issued_by_account_id" uuid,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by_account_id" uuid,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "whitelists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"status" "whitelist_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"reviewer_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "economy_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" "currency_type" DEFAULT 'cash' NOT NULL,
	"amount" integer NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_account_id" uuid,
	"source_character_id" uuid,
	"source_business_id" uuid,
	"target_character_id" uuid,
	"target_business_id" uuid,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"type" "property_type" DEFAULT 'house' NOT NULL,
	"position" jsonb DEFAULT '{}'::jsonb,
	"interior_id" text,
	"price" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"account_id" uuid,
	"character_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_account_id" uuid,
	"actor_character_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "property_ownerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"account_id" uuid,
	"character_id" uuid,
	"is_owner" boolean DEFAULT true NOT NULL,
	"rent" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "property_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_number" text NOT NULL,
	"entrance_position" jsonb DEFAULT '{}'::jsonb,
	"storage_inventory_id" uuid
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" "inventory_owner_type" DEFAULT 'character' NOT NULL,
	"owner_account_id" uuid,
	"owner_character_id" uuid,
	"owner_business_id" uuid,
	"type" "inventory_type" DEFAULT 'player' NOT NULL,
	"capacity" integer DEFAULT 50 NOT NULL,
	"weight_limit" integer DEFAULT 30000 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"slot" smallint DEFAULT 0 NOT NULL,
	"durability" smallint DEFAULT 100 NOT NULL,
	"custom_weight" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"weight" integer DEFAULT 0 NOT NULL,
	"stackable" boolean DEFAULT true NOT NULL,
	"max_stack" integer DEFAULT 100 NOT NULL,
	"usable" boolean DEFAULT false NOT NULL,
	"use_effects" jsonb DEFAULT '{}'::jsonb,
	"metadata_schema" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"job_grade_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"on_duty" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"grade" smallint DEFAULT 0 NOT NULL,
	"salary" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"whitelisted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_number_id" uuid NOT NULL,
	"to_number_id" uuid NOT NULL,
	"status" "phone_call_status" DEFAULT 'missed' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_sec" integer DEFAULT 0 NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "phone_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_number_id" uuid NOT NULL,
	"name" text NOT NULL,
	"number" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_number_id" uuid NOT NULL,
	"to_number_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"character_id" uuid,
	"is_primary" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"name" text PRIMARY KEY NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_account_id" uuid
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "play_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_ip" text,
	"ended_reason" text,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "garages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"type" "garage_type" DEFAULT 'public' NOT NULL,
	"position" jsonb DEFAULT '{}'::jsonb,
	"radius" smallint DEFAULT 5 NOT NULL,
	"capacity" smallint DEFAULT 50 NOT NULL,
	"is_impound" boolean DEFAULT false NOT NULL,
	"business_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"granted_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plate" text NOT NULL,
	"model" text NOT NULL,
	"account_id" uuid,
	"character_id" uuid,
	"business_id" uuid,
	"garage_id" uuid,
	"state" "vehicle_state" DEFAULT 'stored' NOT NULL,
	"fuel" smallint DEFAULT 100 NOT NULL,
	"health" integer DEFAULT 1000 NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb,
	"position" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_role_id_business_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."business_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_roles" ADD CONSTRAINT "business_roles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_appearances" ADD CONSTRAINT "character_appearances_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_flags" ADD CONSTRAINT "character_flags_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_identifiers" ADD CONSTRAINT "account_identifiers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_issued_by_account_id_accounts_id_fk" FOREIGN KEY ("issued_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_revoked_by_account_id_accounts_id_fk" FOREIGN KEY ("revoked_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whitelists" ADD CONSTRAINT "whitelists_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whitelists" ADD CONSTRAINT "whitelists_reviewer_account_id_accounts_id_fk" FOREIGN KEY ("reviewer_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economy_ledger" ADD CONSTRAINT "economy_ledger_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economy_ledger" ADD CONSTRAINT "economy_ledger_source_character_id_characters_id_fk" FOREIGN KEY ("source_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economy_ledger" ADD CONSTRAINT "economy_ledger_source_business_id_businesses_id_fk" FOREIGN KEY ("source_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economy_ledger" ADD CONSTRAINT "economy_ledger_target_character_id_characters_id_fk" FOREIGN KEY ("target_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economy_ledger" ADD CONSTRAINT "economy_ledger_target_business_id_businesses_id_fk" FOREIGN KEY ("target_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_keys" ADD CONSTRAINT "property_keys_unit_id_property_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_keys" ADD CONSTRAINT "property_keys_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_keys" ADD CONSTRAINT "property_keys_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_logs" ADD CONSTRAINT "property_logs_unit_id_property_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_logs" ADD CONSTRAINT "property_logs_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_logs" ADD CONSTRAINT "property_logs_actor_character_id_characters_id_fk" FOREIGN KEY ("actor_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_unit_id_property_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_storage_inventory_id_inventories_id_fk" FOREIGN KEY ("storage_inventory_id") REFERENCES "public"."inventories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_owner_account_id_accounts_id_fk" FOREIGN KEY ("owner_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_owner_character_id_characters_id_fk" FOREIGN KEY ("owner_character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_owner_business_id_businesses_id_fk" FOREIGN KEY ("owner_business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_template_id_item_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."item_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_jobs" ADD CONSTRAINT "character_jobs_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_jobs" ADD CONSTRAINT "character_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_jobs" ADD CONSTRAINT "character_jobs_job_grade_id_job_grades_id_fk" FOREIGN KEY ("job_grade_id") REFERENCES "public"."job_grades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_grades" ADD CONSTRAINT "job_grades_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_calls" ADD CONSTRAINT "phone_calls_from_number_id_phone_numbers_id_fk" FOREIGN KEY ("from_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_calls" ADD CONSTRAINT "phone_calls_to_number_id_phone_numbers_id_fk" FOREIGN KEY ("to_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_contacts" ADD CONSTRAINT "phone_contacts_owner_number_id_phone_numbers_id_fk" FOREIGN KEY ("owner_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_messages" ADD CONSTRAINT "phone_messages_from_number_id_phone_numbers_id_fk" FOREIGN KEY ("from_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_messages" ADD CONSTRAINT "phone_messages_to_number_id_phone_numbers_id_fk" FOREIGN KEY ("to_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_assigned_by_account_id_accounts_id_fk" FOREIGN KEY ("assigned_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_name_permissions_name_fk" FOREIGN KEY ("permission_name") REFERENCES "public"."permissions"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_keys" ADD CONSTRAINT "vehicle_keys_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_keys" ADD CONSTRAINT "vehicle_keys_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_keys" ADD CONSTRAINT "vehicle_keys_granted_by_account_id_accounts_id_fk" FOREIGN KEY ("granted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_logs" ADD CONSTRAINT "vehicle_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_logs" ADD CONSTRAINT "vehicle_logs_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_memberships_unique" ON "business_memberships" USING btree ("business_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_roles_unique_name" ON "business_roles" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "business_roles_unique_rank" ON "business_roles" USING btree ("business_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_name_unique" ON "businesses" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "character_appearances_character_unique" ON "character_appearances" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_flags_unique" ON "character_flags" USING btree ("character_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_cid_unique" ON "characters" USING btree ("cid");--> statement-breakpoint
CREATE INDEX "characters_account_idx" ON "characters" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "configs_namespace_key_unique" ON "configs" USING btree ("namespace","key");--> statement-breakpoint
CREATE UNIQUE INDEX "account_identifiers_type_value_unique" ON "account_identifiers" USING btree ("type","value");--> statement-breakpoint
CREATE INDEX "account_identifiers_account_idx" ON "account_identifiers" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_identifiers_value_idx" ON "account_identifiers" USING btree ("value");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_email_unique" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "accounts_username_idx" ON "accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX "bans_active_idx" ON "bans" USING btree ("expires_at","revoked_at");--> statement-breakpoint
CREATE INDEX "bans_account_idx" ON "bans" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "bans_identifier_idx" ON "bans" USING btree ("identifier_type","identifier_value");--> statement-breakpoint
CREATE UNIQUE INDEX "whitelists_account_unique" ON "whitelists" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "whitelists_status_idx" ON "whitelists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "economy_ledger_created_idx" ON "economy_ledger" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_name_unique" ON "properties" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "property_keys_unique" ON "property_keys" USING btree ("unit_id","account_id","character_id");--> statement-breakpoint
CREATE INDEX "property_logs_unit_idx" ON "property_logs" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "property_ownerships_unit_idx" ON "property_ownerships" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "property_ownerships_account_idx" ON "property_ownerships" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "property_ownerships_character_idx" ON "property_ownerships" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "property_units_unique" ON "property_units" USING btree ("property_id","unit_number");--> statement-breakpoint
CREATE INDEX "inventories_owner_idx" ON "inventories" USING btree ("owner_type","owner_account_id","owner_character_id","owner_business_id");--> statement-breakpoint
CREATE INDEX "inventories_type_idx" ON "inventories" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_items_slot_unique" ON "inventory_items" USING btree ("inventory_id","slot");--> statement-breakpoint
CREATE INDEX "inventory_items_template_idx" ON "inventory_items" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_templates_name_unique" ON "item_templates" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "character_jobs_unique_job" ON "character_jobs" USING btree ("character_id","job_id");--> statement-breakpoint
CREATE INDEX "character_jobs_character_idx" ON "character_jobs" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_grades_job_grade_unique" ON "job_grades" USING btree ("job_id","grade");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_name_unique" ON "jobs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "phone_calls_idx" ON "phone_calls" USING btree ("from_number_id","to_number_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "phone_contacts_unique" ON "phone_contacts" USING btree ("owner_number_id","number");--> statement-breakpoint
CREATE INDEX "phone_messages_convo_idx" ON "phone_messages" USING btree ("from_number_id","to_number_id");--> statement-breakpoint
CREATE UNIQUE INDEX "phone_numbers_number_unique" ON "phone_numbers" USING btree ("number");--> statement-breakpoint
CREATE UNIQUE INDEX "role_assignments_unique" ON "role_assignments" USING btree ("account_id","role_id");--> statement-breakpoint
CREATE INDEX "role_assignments_account_idx" ON "role_assignments" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_unique" ON "role_permissions" USING btree ("role_id","permission_name");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_unique" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "play_sessions_account_idx" ON "play_sessions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "garages_name_unique" ON "garages" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_keys_unique" ON "vehicle_keys" USING btree ("vehicle_id","account_id");--> statement-breakpoint
CREATE INDEX "vehicle_logs_vehicle_idx" ON "vehicle_logs" USING btree ("vehicle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_plate_unique" ON "vehicles" USING btree ("plate");--> statement-breakpoint
CREATE INDEX "vehicles_owner_idx" ON "vehicles" USING btree ("account_id","character_id","business_id");--> statement-breakpoint
CREATE INDEX "vehicles_garage_idx" ON "vehicles" USING btree ("garage_id");