import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "../../schema";

export class DatabaseService {
	private static instance: DatabaseService;

	private pool: Pool | null = null;
	private db: NodePgDatabase<typeof schema> | null = null;

	private constructor() {
		// Private constructor to prevent direct instantiation
	}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}

		return DatabaseService.instance;
	}

	/**
	 * Initialize the database connection
	 * @param config Optional pool configuration, defaults to DATABASE_URL from env
	 */
	public initialize(config?: PoolConfig): void {
		if (this.pool) {
			console.warn("Database already initialized");
			return;
		}

		const convars = this.getConvars();
		const connStr = `postgresql://${convars.user}:${convars.password}@${convars.host}:${convars.port}/${convars.database}`;

		const poolConfig: PoolConfig = config || {
			connectionString: connStr,
			max: convars.maxConnections, // Maximum number of clients in the pool
			idleTimeoutMillis: convars.idleTimeout, // Close idle clients after 30 seconds
			connectionTimeoutMillis: convars.connectionTimeout, // Return an error after 2 seconds if connection could not be established
		};

		if (!poolConfig.connectionString) {
			throw new Error("DATABASE_URL is not defined in environment variables");
		}

		this.pool = new Pool(poolConfig);
		this.db = drizzle(this.pool, { schema });

		// Handle pool errors
		this.pool.on("error", (err) => {
			console.error("Unexpected error on idle database client", err);
		});

		console.log("Database connection initialized successfully");
	}

	/**
	 * Get the Drizzle database instance
	 * @throws Error if database is not initialized
	 */
	public getDatabase(): NodePgDatabase<typeof schema> {
		if (!this.db) {
			throw new Error("Database not initialized. Call initialize() first.");
		}
		return this.db;
	}

	/**
	 * Get the raw PostgreSQL pool instance
	 * @throws Error if database is not initialized
	 */
	public getPool(): Pool {
		if (!this.pool) {
			throw new Error("Database not initialized. Call initialize() first.");
		}
		return this.pool;
	}

	/**
	 * Check if the database is connected
	 */
	public async isConnected(): Promise<boolean> {
		if (!this.pool) {
			return false;
		}

		try {
			const client = await this.pool.connect();
			await client.query("SELECT 1");
			client.release();
			return true;
		} catch (error) {
			console.error("Database connection check failed:", error);
			return false;
		}
	}

	/**
	 * Close the database connection and cleanup resources
	 */
	public async close(): Promise<void> {
		if (this.pool) {
			await this.pool.end();
			this.pool = null;
			this.db = null;
			console.log("Database connection closed");
		}
	}

	/**
	 * Execute a health check query
	 */
	public async healthCheck(): Promise<{ status: "healthy" | "unhealthy"; latency?: number }> {
		if (!this.pool) {
			return { status: "unhealthy" };
		}

		try {
			const start = Date.now();
			const client = await this.pool.connect();
			await client.query("SELECT 1");
			client.release();
			const latency = Date.now() - start;

			return { status: "healthy", latency };
		} catch (error) {
			console.error("Health check failed:", error);
			return { status: "unhealthy" };
		}
	}

	private getConvars() {
		return {
			host: GetConvar("noverna_db_host", "localhost"),
			port: parseInt(GetConvar("noverna_db_port", "5432"), 10),
			database: GetConvar("noverna_db_database", "noverna"),
			user: GetConvar("noverna_db_user", "noverna_user"),
			password: GetConvar("noverna_db_password", "password"),
			maxConnections: parseInt(GetConvar("noverna_db_max_connections", "20"), 10),
			idleTimeout: parseInt(GetConvar("noverna_db_idle_timeout", "30000"), 10),
			connectionTimeout: parseInt(GetConvar("noverna_db_connection_timeout", "2000"), 10),
		};
	}
}
