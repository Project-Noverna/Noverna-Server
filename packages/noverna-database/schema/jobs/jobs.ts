import { boolean, index, integer, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { characters } from "../characters/characters";

export const jobs = pgTable(
	"jobs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(), // e.g., "police", "ems"
		label: text("label").notNull(),
		whitelisted: boolean("whitelisted").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({ nameUnique: uniqueIndex("jobs_name_unique").on(t.name) }),
);

export const jobGrades = pgTable(
	"job_grades",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "cascade" }),
		name: text("name").notNull(), // e.g., "officer"
		label: text("label").notNull(),
		grade: smallint("grade").notNull().default(0),
		salary: integer("salary").notNull().default(0),
	},
	(t) => ({
		jobGradeUnique: uniqueIndex("job_grades_job_grade_unique").on(t.jobId, t.grade),
	}),
);

export const characterJobs = pgTable(
	"character_jobs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		characterId: uuid("character_id")
			.notNull()
			.references(() => characters.id, { onDelete: "cascade" }),
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict" }),
		jobGradeId: uuid("job_grade_id")
			.notNull()
			.references(() => jobGrades.id, { onDelete: "restrict" }),
		isPrimary: boolean("is_primary").notNull().default(true),
		onDuty: boolean("on_duty").notNull().default(false),
		assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		uniquePerJob: uniqueIndex("character_jobs_unique_job").on(t.characterId, t.jobId),
		characterIdx: index("character_jobs_character_idx").on(t.characterId),
	}),
);
