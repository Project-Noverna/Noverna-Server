/**
 * Node.js Module (nur serverseitig verfügbar)
 * Diese werden lazy geladen, um Client-seitige Fehler zu vermeiden
 */
let fsModule: typeof import("node:fs") | null = null;
let pathModule: typeof import("node:path") | null = null;

/**
 * Lädt die Node.js Module einmal (nur serverseitig)
 */
const loadNodeModules = (): void => {
	if (IsDuplicityVersion() && !fsModule) {
		fsModule = require("node:fs");
		pathModule = require("node:path");
	}
};

/**
 * Log-Level Enumeration
 */
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

/**
 * ANSI-Farbcodes für Terminal-Ausgabe
 */
const Colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",

	// Textfarben
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	gray: "\x1b[90m",

	// Hintergrundfarben
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
} as const;

/**
 * Log-Eintrag Interface für strukturierte Logs
 */
export interface LogEntry {
	timestamp: string;
	level: string;
	message: string;
	metadata?: Record<string, unknown>;
	stack?: string;
}

/**
 * Logger-Konfiguration
 */
export interface LoggerConfig {
	/** Minimales Log-Level, das ausgegeben werden soll */
	minLevel?: LogLevel;
	/** Aktiviert Console-Logging */
	enableConsole?: boolean;
	/** Aktiviert File-Logging */
	enableFile?: boolean;
	/** Pfad zur Log-Datei */
	logFilePath?: string;
	/** Aktiviert farbige Ausgabe in der Console */
	enableColors?: boolean;
	/** Callback für externe Log-Speicherung (z.B. API) */
	onLog?: (entry: LogEntry) => void | Promise<void>;
	/** Format für Timestamps */
	timestampFormat?: "iso" | "locale" | "unix";
}

/**
 * Robuster Logger mit Console und File-Logging
 */
export class Logger {
	private config: LoggerConfig;
	private logBuffer: LogEntry[] = [];
	private writeQueue: Promise<void> = Promise.resolve();

	constructor(config: LoggerConfig = {}) {
		this.config = {
			minLevel: config.minLevel ?? LogLevel.INFO,
			enableConsole: config.enableConsole ?? true,
			enableFile: false,
			enableColors: config.enableColors ?? true,
			onLog: config.onLog ?? (() => {}),
			timestampFormat: config.timestampFormat ?? "iso",
		};

		if (IsDuplicityVersion()) {
			loadNodeModules();
			this.config.enableFile = config.enableFile ?? false;
			this.config.logFilePath = config.logFilePath ?? pathModule?.join(process.cwd(), "logs", "app.log");
		}

		// Erstelle Log-Verzeichnis falls File-Logging aktiviert ist
		if (this.config.enableFile) {
			this.ensureLogDirectory();
		}
	}

	/**
	 * Stellt sicher, dass das Log-Verzeichnis existiert
	 */
	private ensureLogDirectory(): void {
		if (IsDuplicityVersion() && fsModule && pathModule && this.config.logFilePath) {
			const logDir = pathModule.dirname(this.config.logFilePath);
			if (!fsModule.existsSync(logDir)) {
				fsModule.mkdirSync(logDir, { recursive: true });
			}
		}
	}

	/**
	 * Formatiert einen Timestamp basierend auf der Konfiguration
	 */
	private formatTimestamp(): string {
		const now = new Date();
		switch (this.config.timestampFormat) {
			case "unix":
				return now.getTime().toString();
			case "locale":
				return now.toLocaleString("de-DE");
			case "iso":
				return now.toISOString();
			default:
				return now.toISOString();
		}
	}

	/**
	 * Erstellt einen strukturierten Log-Eintrag
	 */
	private createLogEntry(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): LogEntry {
		return {
			timestamp: this.formatTimestamp(),
			level: LogLevel[level],
			message,
			metadata,
			stack: error?.stack,
		};
	}

	/**
	 * Färbt einen Text mit ANSI-Codes
	 */
	private colorize(text: string, color: keyof typeof Colors): string {
		if (!this.config.enableColors) return text;
		return `${Colors[color]}${text}${Colors.reset}`;
	}

	/**
	 * Formatiert einen Log-Eintrag für Console-Ausgabe
	 */
	private formatConsoleOutput(entry: LogEntry): string {
		const levelColors: Record<string, keyof typeof Colors> = {
			DEBUG: "gray",
			INFO: "blue",
			WARN: "yellow",
			ERROR: "red",
		};

		const color = levelColors[entry.level] || "white";
		const timestamp = this.colorize(entry.timestamp, "dim");
		const level = this.colorize(`[${entry.level}]`, color);
		let output = `${timestamp} ${level} ${entry.message}`;

		if (entry.metadata && Object.keys(entry.metadata).length > 0) {
			output += `\n${this.colorize("Metadata:", "cyan")} ${JSON.stringify(entry.metadata, null, 2)}`;
		}

		if (entry.stack) {
			output += `\n${this.colorize("Stack:", "red")}\n${entry.stack}`;
		}

		return output;
	}

	/**
	 * Formatiert einen Log-Eintrag für File-Ausgabe (JSON)
	 */
	private formatFileOutput(entry: LogEntry): string {
		return `${JSON.stringify(entry)}\n`;
	}

	/**
	 * Schreibt einen Log-Eintrag in die Datei (asynchron mit Queue)
	 */
	private async writeToFile(entry: LogEntry): Promise<void> {
		if (!IsDuplicityVersion() || !this.config.enableFile || !fsModule || !this.config.logFilePath) return;

		const fs = fsModule;
		const logFilePath = this.config.logFilePath;

		// Füge zur Queue hinzu, um Race Conditions zu vermeiden
		this.writeQueue = this.writeQueue
			.then(async () => {
				const logLine = this.formatFileOutput(entry);
				await fs.promises.appendFile(logFilePath, logLine, "utf-8");
			})
			.catch((error) => {
				// Fehler beim Schreiben in die Datei sollten nicht den gesamten Logger crashen
				console.error("Failed to write to log file:", error);
			});

		return this.writeQueue;
	}

	/**
	 * Interne Log-Methode
	 */
	private async log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): Promise<void> {
		// Prüfe, ob das Log-Level hoch genug ist
		if (level < (this.config.minLevel ?? LogLevel.DEBUG)) return;

		const entry = this.createLogEntry(level, message, metadata, error);

		// Speichere im Buffer (für zukünftige API-Integration)
		this.logBuffer.push(entry);

		// Console-Ausgabe
		if (this.config.enableConsole) {
			const consoleOutput = this.formatConsoleOutput(entry);
			switch (level) {
				case LogLevel.ERROR:
					console.error(consoleOutput);
					break;
				case LogLevel.WARN:
					console.warn(consoleOutput);
					break;
				case LogLevel.DEBUG:
					console.debug(consoleOutput);
					break;
				default:
					console.log(consoleOutput);
			}
		}

		// File-Ausgabe
		if (this.config.enableFile) {
			await this.writeToFile(entry);
		}

		// Callback für externe Integration (z.B. API)
		try {
			if (this.config.onLog) {
				await this.config.onLog(entry);
			}
		} catch (error) {
			// Fehler in der externen Integration sollten den Logger nicht crashen
			console.error("Error in onLog callback:", error);
		}
	}

	/**
	 * Debug-Level Log
	 */
	public debug(message: string, metadata?: Record<string, unknown>): void {
		this.log(LogLevel.DEBUG, message, metadata);
	}

	/**
	 * Info-Level Log
	 */
	public info(message: string, metadata?: Record<string, unknown>): void {
		this.log(LogLevel.INFO, message, metadata);
	}

	/**
	 * Warning-Level Log
	 */
	public warn(message: string, metadata?: Record<string, unknown>): void {
		this.log(LogLevel.WARN, message, metadata);
	}

	/**
	 * Error-Level Log
	 */
	public error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
		this.log(LogLevel.ERROR, message, metadata, error);
	}

	/**
	 * Gibt alle gepufferten Logs zurück (für API-Integration)
	 */
	public getLogBuffer(): LogEntry[] {
		return [...this.logBuffer];
	}

	/**
	 * Leert den Log-Buffer
	 */
	public clearLogBuffer(): void {
		this.logBuffer = [];
	}

	/**
	 * Rotiert die Log-Datei (erstellt Backup und startet neu)
	 */
	public async rotateLogFile(): Promise<void> {
		if (!IsDuplicityVersion() || !this.config.enableFile || !this.config.logFilePath || !fsModule) return;

		// Warte, bis alle ausstehenden Schreibvorgänge abgeschlossen sind
		await this.writeQueue;

		const logFile = this.config.logFilePath;
		if (!fsModule.existsSync(logFile)) return;

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupFile = logFile.replace(/\.log$/, `.${timestamp}.log`);

		try {
			await fsModule.promises.rename(logFile, backupFile);
			this.info("Log file rotated", { backupFile });
		} catch (error) {
			this.error("Failed to rotate log file", error as Error);
		}
	}

	/**
	 * Aktualisiert die Logger-Konfiguration
	 */
	public updateConfig(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config };

		if (this.config.enableFile) {
			this.ensureLogDirectory();
		}
	}

	/**
	 * Schließt den Logger und wartet auf ausstehende Schreibvorgänge
	 */
	public async close(): Promise<void> {
		await this.writeQueue;
	}
}

/**
 * Erstellt eine Default-Logger-Instanz
 */
export const createLogger = (config?: LoggerConfig): Logger => {
	return new Logger(config);
};

/**
 * Default-Export: Globale Logger-Instanz
 */
export default createLogger();
