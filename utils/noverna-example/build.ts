import Bun from "bun";

// Build script for noverna-core resource
// Produces CommonJS bundles in build/client and build/server for FiveM

async function buildAll() {
	const client = await Bun.build({
		entrypoints: ["./src/client/index.ts"],
		outdir: "./build/client",
		target: "browser",
		format: "cjs",
		minify: false,
		sourcemap: "none",
		tsconfig: "./tsconfig.json",
		naming: "[name].js",
	});

	if (!client.success) {
		console.error("Client build failed:", client.logs.map((l) => l.message).join("\n"));
		process.exitCode = 1;
	}

	const server = await Bun.build({
		entrypoints: ["./src/server/index.ts"],
		outdir: "./build/server",
		target: "node",
		format: "cjs",
		minify: false,
		sourcemap: "none",
		tsconfig: "./tsconfig.json",
		naming: "[name].js",
	});

	if (!server.success) {
		console.error("Server build failed:", server.logs.map((l) => l.message).join("\n"));
		process.exitCode = 1;
	}
}

buildAll();
