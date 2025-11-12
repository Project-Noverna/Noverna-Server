import { DatabaseService } from "@noverna/database";

// Entry Point of the Noverna Core Server Resource
setImmediate(() => {
	const databaseService = DatabaseService.getInstance();
	databaseService.initialize();
	console.log("Noverna-Core was Successfully Loaded on the Server!");
});
