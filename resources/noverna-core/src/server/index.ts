import { DatabaseService } from "@noverna/database";
import { createLogger, LogLevel } from "@noverna/logger";

// Entry Point of the Noverna Core Server Resource
setImmediate(() => {
	const logger = createLogger({
		enableColors: true,
		enableFile: true,
		enableConsole: true,
		logFilePath: "logs/noverna-core.log",
		minLevel: LogLevel.DEBUG,
		timestampFormat: "locale",
	});

	const databaseService = DatabaseService.getInstance();
	databaseService.initialize();
	logger.info("Noverna Core Server initialized.");
});
